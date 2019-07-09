import { createRequestBuilder } from '@commercetools/api-request-builder';
import { createClient } from '@commercetools/sdk-client';
import { createAuthMiddlewareForClientCredentialsFlow } from '@commercetools/sdk-middleware-auth';
import { createHttpMiddleware } from '@commercetools/sdk-middleware-http';
import { createQueueMiddleware } from '@commercetools/sdk-middleware-queue';
import fetch from 'node-fetch';
import {
  AddAttributeAction, Category, Channel, CustomObject, CustomObjectDraft, CustomType,
  CustomTypeDraft, Entity, Extension, ExtensionDraft, InventoryEntry,
  InventoryEntryDraft,PagedQueryResult, Product, ProductDraft, ProductType,
  Subscription, SubscriptionDraft
} from './types';

interface CommercetoolsConfig {
  projectKey: string,
  clientId: string,
  clientSecret: string,
  locale: string,
  concurrency: number,
  authHost: string,
  apiHost: string,
}

export class Commercetools {
  public locale: string | undefined;

  private readonly getConfig: () => Promise<CommercetoolsConfig>;
  private client;
  private request;
  private headers;

  constructor(getConfig: () => Promise<CommercetoolsConfig>) {
    this.getConfig = getConfig;
  }

  public async initClient(): Promise<any> {
    if (this.client) { return; }

    const config = await this.getConfig();
    const { projectKey, clientId, clientSecret, concurrency, locale, apiHost, authHost } = config;

    this.locale = locale;

    const httpMiddleware = createHttpMiddleware({ host: apiHost, fetch });
    const queueMiddleware = createQueueMiddleware({ concurrency });
    const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
      host: authHost,
      projectKey,
      fetch,
      credentials: { clientId, clientSecret },
    });

    this.headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    this.request = () => createRequestBuilder({ projectKey });
    this.client = createClient({ middlewares: [authMiddleware, httpMiddleware, queueMiddleware] });

    this.locale = locale;

    return this.client;
  }

  public async resolveKeyAndVersion(keyOrEntity: string | Entity, fetchByKey: Function): Promise<Entity> {
    switch (typeof keyOrEntity) {
      case 'object':
        return new Promise(resolve => {
          resolve({
            key: (keyOrEntity as Entity).key,
            version: (keyOrEntity as Entity).version,
          });
        });

      case 'string':
        return fetchByKey(keyOrEntity)
          .then((entity: Entity) => ({
            key: keyOrEntity,
            version: entity.version,
          }));

      default:
        throw new Error(`Invalid value for keyOrEntity: ${JSON.stringify(keyOrEntity)}`);
    }
  }

  // --- Orders --- //

  public async fetchExpandedOrder(id: string, expansions?: string[]): Promise<any> { // TODO define Order interface
    await this.initClient();

    let uri = this.request().orders.byId(id);
    if (expansions) {
      expansions.forEach(expansion => uri = uri.expand(expansion))
    }

    const fetchRequest = {
      uri: uri.build(),
      method: 'GET',
      headers: this.headers,
    };

    return this.client.execute(fetchRequest).then(({ body: order }) => order);
  }

  public async fetchExpandedOrders(page: number, perPage: number, expansions?: string[]): Promise<PagedQueryResult> {
    await this.initClient();

    let uri = this.request().orders.page(page).perPage(perPage);
    if (expansions) {
      expansions.forEach(expansion => uri = uri.expand(expansion))
    }

    const fetchRequest = {
      uri: uri.build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  // --- Channels --- //

  public async fetchChannelByKey(key: string): Promise<Channel> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().channels.where(`key="${key}"`).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(({ body: { results } }) => results[0])
        .catch(error => {
          console.dir(error, { depth: null });
          throw error;
        })
    );
  }

  // --- CustomObjects --- //

  public async fetchCustomObjects(page: number, perPage: number, condition?: string, sort?: string): Promise<CustomObject> {
    await this.initClient();

    let uri = this.request().customObjects.page(page).perPage(perPage);

    if (condition) {
      uri = uri.where(condition);
    }

    if (sort) {
      uri = uri.parse({ sort })
    }

    const fetchRequest = {
      uri: uri.build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  public async fetchCustomObjectById(id: string): Promise<CustomObject> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().customObjects.where(`id="${id}"`).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult).results[0])
    );
  }

  public async saveCustomObject(customObjectDraft: CustomObjectDraft): Promise<CustomObject> {
    await this.initClient();

    const postRequest = {
      uri: this.request().customObjects.build(),
      method: 'POST',
      headers: this.headers,
      body: customObjectDraft,
    };

    return (
      this.client
        .execute(postRequest)
        .then(response => response.body)
    );
  }

  public async deleteCustomObjectById(id: string): Promise<any> {
    await this.initClient();

    const deleteRequest = {
      uri: this.request().customObjects.byId(id).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return this.client.execute(deleteRequest);
  }

  // --- InventoryEntries --- //

  public async fetchInventoryEntry(sku: string, supplyChannelKey: string): Promise<InventoryEntry> {
    await this.initClient();

    const channelRequest = {
      uri: this.request().channels.where(`key="${supplyChannelKey}"`).build(),
      method: 'GET',
      headers: this.headers,
    };

    const channel = await this.client.execute(channelRequest).then(({ body: { results } }) => results[0]);

    const inventoryRequest = {
      uri: this.request().inventory.where(`sku="${sku}" and supplyChannel(typeId="channel" and id="${channel.id}")`).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(inventoryRequest)
        .then(({ body: { results } }) => results[0])
    );
  }

  public async createInventoryEntry(inventoryEntryDraft: InventoryEntryDraft): Promise<InventoryEntry> {
    await this.initClient();

    const postRequest = {
      uri: this.request().inventory.build(),
      method: 'POST',
      headers: this.headers,
      body: inventoryEntryDraft,
    };

    return (
      this.client
        .execute(postRequest)
        .then(response => response.body)
    );
  }

  public async deleteInventoryEntry(id: string, version: number): Promise<void> {
    await this.initClient();

    const deleteRequest = {
      uri: this.request().inventory.byId(id).withVersion(version).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return (
      this.client
        .execute(deleteRequest)
        .catch(error => {
          console.dir(error, { depth: null });
          throw error;
        })
    );
  }

  // --- Products --- //

  public async fetchProducts(page: number, perPage: number, sort?: string): Promise<PagedQueryResult> {
    await this.initClient();

    let uri = this.request().products.page(page).perPage(perPage);
    if (sort) {
      uri = uri.sort(sort);
    }

    const fetchRequest = {
      uri: uri.build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body as PagedQueryResult)
    );
  }

  public async fetchProductById(id: string): Promise<Product> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().products.byId(id).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body)
    );
  }

  public async fetchProductByEan(ean: string): Promise<Product> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().products.where(`masterData(current(masterVariant(attributes(name="ean" and value="${ean}"))))`).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult).results[0])
    );
  }

  public async fetchProductByProductCode(productCode: string): Promise<Product> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().products.where(`masterData(current(masterVariant(attributes(name="productCode" and value="${productCode}"))))`).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult).results[0])
    );
  }

  public async fetchProductByVariantSku(sku: string): Promise<Product> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().products.where(`masterData(current(masterVariant(sku="${sku}")))`).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult).results[0])
    );
  }

  public async createProduct(productDraft: ProductDraft): Promise<Product> {
    await this.initClient();

    const postRequest = {
      uri: this.request().products.build(),
      method: 'POST',
      headers: this.headers,
      body: productDraft,
    };

    return (
      this.client
        .execute(postRequest)
        .then(response => response.body)
    );
  }

  // --- ProductProjections(Search) ---

  public async fetchProductProjectionMarkedBySku(sku: string): Promise<any> { // TODO define ProductProjection interface
    await this.initClient();

    const fetchRequest = {
      uri: this.request().productProjectionsSearch.filterByQuery(`variants.sku:"${sku}"`).markMatchingVariants().page(1).perPage(1).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult).results[0])
    );
  }

  public async searchProductProjections(searchTerm: string, locale: string, filterByProductTypeKey?: string): Promise<any> { // TODO define ProductProjection interface
    await this.initClient();

    let uri = this.request().productProjectionsSearch.markMatchingVariants().text(searchTerm, locale);

    if (filterByProductTypeKey) {
      const fetchProductTypeRequest = {
        uri: this.request().productTypes.byKey(filterByProductTypeKey).build(),
        method: 'GET',
        headers: this.headers,
      };
      const productTypeId = await this.client.execute(fetchProductTypeRequest).then(response => response.body.id);
      uri = uri.filterByQuery(`productType.id:"${productTypeId}"`)
    }

    const fetchRequest = {
      uri: uri.build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  public async getPossibleValuesForAttribute(attributeName: string): Promise<string[]> {
    await this.initClient();

    const facetSelector = `variants.attributes.${attributeName}`;

    const fetchRequest = {
      uri: this.request().productProjectionsSearch.facet(facetSelector).page(1).perPage(1).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body.facets[facetSelector].terms.map(({ term }) => term))
    );
  }

  // --- ProductTypes --- //

  public async fetchProductTypeByKey(key: String): Promise<ProductType> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().productTypes.byKey(key).build(),
      method: 'GET',
      headers: this.headers,
    };

    return this.client.execute(fetchRequest).then(response => response.body);
  }

  public async updateProductType(keyOrProductType, actions: AddAttributeAction[]): Promise<void> {
    await this.initClient();

    const { key, version } = await this.resolveKeyAndVersion(keyOrProductType, this.fetchProductTypeByKey);

    const updateRequest = {
      uri: this.request().productTypes.byKey(key).withVersion(version).build(),
      method: 'POST',
      headers: this.headers,
      body: { version, actions },
    };

    return this.client.execute(updateRequest);
  }

  // --- Carts ---

  public async fetchCarts(page: number, perPage: number): Promise<PagedQueryResult> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().carts.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  // --- Categories ---

  public async fetchCategories(page: number, perPage: number): Promise<PagedQueryResult> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().categories.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  public async fetchCategoryById(id: string): Promise<Category> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().categories.byId(id).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as Category))
    );
  }

  // --- CustomTypes ---

  public async fetchCustomTypes(page: number, perPage: number): Promise<PagedQueryResult> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().types.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  public async createCustomType(customTypeDraft: CustomTypeDraft): Promise<CustomType> {
    await this.initClient();

    const postRequest = {
      uri: this.request().types.build(),
      method: 'POST',
      headers: this.headers,
      body: customTypeDraft,
    };

    return (
      this.client
        .execute(postRequest)
        .then(response => response.body)
    );
  }

  public async deleteCustomType(id: string, version: number): Promise<void> {
    await this.initClient();

    const deleteRequest = {
      uri: this.request().types.byId(id).withVersion(version).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return (
      this.client
        .execute(deleteRequest)
        .catch(error => {
          console.dir(error, { depth: null });
          throw error;
        })
    );
  }

  // --- Extensions ---

  public async fetchExtensions(page: number, perPage: number): Promise<PagedQueryResult> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().extensions.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  public async fetchExtensionById(id: string): Promise<Extension> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().extensions.byId(id).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as Extension))
    );
  }

  public async createExtension(extensionDraft: ExtensionDraft): Promise<Extension> {
    await this.initClient();

    const postRequest = {
      uri: this.request().extensions.build(),
      method: 'POST',
      headers: this.headers,
      body: extensionDraft,
    };

    return (
      this.client
        .execute(postRequest)
        .then(response => (response.body as Extension))
    );
  }

  public async deleteExtension(id: string, version: number): Promise<void> {
    await this.initClient();

    const deleteRequest = {
      uri: this.request().extensions.byId(id).withVersion(version).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return (
      this.client
        .execute(deleteRequest)
        .catch(error => {
          console.dir(error, { depth: null });
          throw error;
        })
    );
  }

  // --- Subscriptions ---

  public async fetchSubscriptions(page: number, perPage: number): Promise<PagedQueryResult> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().subscriptions.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as PagedQueryResult))
    );
  }

  public async fetchSubscriptionById(id: string): Promise<Subscription> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().subscriptions.byId(id).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as Subscription))
    );
  }

  public async createSubscription(subscriptionDraft: SubscriptionDraft): Promise<Subscription> {
    await this.initClient();

    const postRequest = {
      uri: this.request().subscriptions.build(),
      method: 'POST',
      headers: this.headers,
      body: subscriptionDraft,
    };

    return (
      this.client
        .execute(postRequest)
        .then(response => (response.body as Subscription))
    );
  }

  public async deleteSubscription(id: string, version: number): Promise<void> {
    await this.initClient();

    const deleteRequest = {
      uri: this.request().subscriptions.byId(id).withVersion(version).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return (
      this.client
        .execute(deleteRequest)
        .catch(error => {
          console.dir(error, { depth: null });
          throw error;
        })
    );
  }
}
