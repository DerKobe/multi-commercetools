import { createRequestBuilder } from '@commercetools/api-request-builder';
import { createClient } from '@commercetools/sdk-client';
import { createAuthMiddlewareForClientCredentialsFlow } from '@commercetools/sdk-middleware-auth';
import { createHttpMiddleware } from '@commercetools/sdk-middleware-http';
import { createQueueMiddleware } from '@commercetools/sdk-middleware-queue';
import 'isomorphic-fetch';
import {
  AddAttributeAction, Category, Channel, ChannelDraft, CustomObject,
  CustomObjectDraft, CustomType, CustomTypeDraft, Entity, Extension,
  ExtensionDraft, InventoryEntry, InventoryEntryDraft, Order, PagedQueryResult,
  Product, ProductDraft, ProductType, ProductTypeDraft, Sort, Subscription,
  SubscriptionDraft, TaxCategory, TaxCategoryDraft, UpdateOrderAction
} from './types';

type CommercetoolsConfigGetter = () => Promise<CommercetoolsConfig>;

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

  private readonly getConfig?: () => Promise<CommercetoolsConfig>;

  private config?: CommercetoolsConfig;
  private client;
  private request;
  private headers;

  constructor(passedConfig: CommercetoolsConfig | CommercetoolsConfigGetter) {
    if (typeof passedConfig === 'function') {
      this.getConfig = passedConfig;
    } else {
      this.config = passedConfig
    }
  }

  public async initClient(): Promise<any> {
    if (this.client) { return; }

    if (this.getConfig) {
      this.config = await this.getConfig();
    }

    const { projectKey, clientId, clientSecret, concurrency, locale, apiHost, authHost } = this.config as CommercetoolsConfig;

    this.locale = locale;

    const httpMiddleware = createHttpMiddleware({ host: apiHost, fetch });
    const queueMiddleware = createQueueMiddleware({ concurrency });
    const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
      host: authHost,
      projectKey,
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

  public async fetchExpandedOrders(page: number, perPage: number, expansions?: string[], sort?: Sort): Promise<PagedQueryResult<Order>> {
    await this.initClient();

    let uri = this.request().orders.page(page).perPage(perPage);

    if (expansions) {
      expansions.forEach(expansion => uri = uri.expand(expansion))
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
        .then(response => response.body)
    );
  }

  public async updateOrder(id: string, version: number, actions: UpdateOrderAction[]): Promise<any> { // TODO define Order interface
    await this.initClient();

    const updateRequest = {
      uri: this.request().orders.byId(id).build(),
      method: 'POST',
      headers: this.headers,
      body: { version, actions }
    };

    return this.client.execute(updateRequest).then(({ body: order }) => order);
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
    );
  }

  public async createChannel(body: ChannelDraft): Promise<Channel> {
    await this.initClient();

    const createRequest = {
      uri: this.request().channels.build(),
      method: 'POST',
      headers: this.headers,
      body,
    };

    return (
      this.client
        .execute(createRequest)
        .then(({ body: channel }) => channel as Channel)
    )
  }

  public async deleteChannelByKey(key: string): Promise<void> {
    await this.initClient();

    const channel = await this.fetchChannelByKey(key);

    const deleteRequest = {
      uri: this.request().channels.byId(channel.id).withVersion(channel.version).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return this.client.execute(deleteRequest);
  }

  // --- CustomObjects --- //

  public async fetchCustomObjects(page: number, perPage: number, condition?: string, sort?: Sort): Promise<PagedQueryResult<CustomObject>> {
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
        .then(response => response.body)
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
        .then(response => (response.body as PagedQueryResult<CustomObject>).results[0])
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

    const channel = await this.fetchChannelByKey(supplyChannelKey);

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

  public async fetchInventoryEntriesByChannelId(channelId: string): Promise<PagedQueryResult<InventoryEntry>> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().inventory.where(`supplyChannel(typeId="channel" and id="${channelId}")`).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body)
    );
  }

  // --- Products --- //

  public async fetchProducts(page: number, perPage: number, sort?: string): Promise<PagedQueryResult<Product>> {
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
        .then(response => response.body)
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
        .then(response => (response.body as PagedQueryResult<Product>).results[0])
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
        .then(response => (response.body as PagedQueryResult<Product>).results[0])
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
        .then(response => (response.body as PagedQueryResult<Product>).results[0])
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
        .then(response => (response.body as PagedQueryResult<any>).results[0])
    );
  }

  public async searchProductProjections(searchTerm: string, locale: string, filterByProductTypeKey?: string): Promise<PagedQueryResult<any>> { // TODO define ProductProjection interface
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
        .then(response => (response.body as PagedQueryResult<any>))
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

  public async createProductType(productTypeDraft: ProductTypeDraft): Promise<ProductType> {
    await this.initClient();

    const createRequest = {
      uri: this.request().productTypes.build(),
      method: 'POST',
      headers: this.headers,
      body: productTypeDraft,
    };

    return (
      this.client
        .execute(createRequest)
        .then(response => response.body)
    );
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

  public async deleteProductType(keyOrProductType): Promise<void> {
    await this.initClient();

    const { key, version } = await this.resolveKeyAndVersion(keyOrProductType, this.fetchProductTypeByKey);

    const createRequest = {
      uri: this.request().productTypes.byKey(key).withVersion(version).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return this.client.execute(createRequest);
  }

  // --- Carts ---

  public async fetchCarts(page: number, perPage: number): Promise<PagedQueryResult<any>> { // TODO define Cart interface
    await this.initClient();

    const fetchRequest = {
      uri: this.request().carts.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body)
    );
  }

  // --- Categories ---

  public async fetchCategories(page: number, perPage: number): Promise<PagedQueryResult<Category>> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().categories.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body)
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

  public async fetchCustomTypes(page: number, perPage: number): Promise<PagedQueryResult<CustomType>> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().types.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body)
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

  public async fetchExtensions(page: number, perPage: number): Promise<PagedQueryResult<Extension>> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().extensions.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body)
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

  public async fetchSubscriptions(page: number, perPage: number): Promise<PagedQueryResult<Subscription>> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().subscriptions.page(page).perPage(perPage).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => response.body)
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

  // --- TaxCategory ---

  public async fetchTaxCategoryByKey(key: string): Promise<TaxCategory> {
    await this.initClient();

    const fetchRequest = {
      uri: this.request().taxCategories.byKey(key).build(),
      method: 'GET',
      headers: this.headers,
    };

    return (
      this.client
        .execute(fetchRequest)
        .then(response => (response.body as TaxCategory))
    );
  }

  public async createTaxCategory(taxCategoryDraft: TaxCategoryDraft): Promise<TaxCategory> {
    await this.initClient();

    const createRequest = {
      uri: this.request().taxCategories.build(),
      method: 'POST',
      headers: this.headers,
      body: taxCategoryDraft,
    };

    return (
      this.client
        .execute(createRequest)
        .then(response => (response.body as Extension))
    );
  }

  public async deleteTaxCategory(key: string): Promise<void> {
    await this.initClient();

    const { version } = await this.resolveKeyAndVersion(key, this.fetchTaxCategoryByKey);

    await this.initClient();

    const deleteRequest = {
      uri: this.request().taxCategories.byKey(key).withVersion(version).build(),
      method: 'DELETE',
      headers: this.headers,
    };

    return this.client.execute(deleteRequest);
  }
}
