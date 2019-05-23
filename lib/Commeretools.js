"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_request_builder_1 = require("@commercetools/api-request-builder");
const sdk_client_1 = require("@commercetools/sdk-client");
const sdk_middleware_auth_1 = require("@commercetools/sdk-middleware-auth");
const sdk_middleware_http_1 = require("@commercetools/sdk-middleware-http");
const sdk_middleware_queue_1 = require("@commercetools/sdk-middleware-queue");
const node_fetch_1 = require("node-fetch");
class Commercetools {
    constructor(config) {
        this.config = config;
        this.locale = config.locale;
    }
    initClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                return;
            }
            const { projectKey, clientId, clientSecret, concurrency, locale, apiHost, authHost } = this.config;
            const httpMiddleware = sdk_middleware_http_1.createHttpMiddleware({ host: apiHost, fetch: node_fetch_1.default });
            const queueMiddleware = sdk_middleware_queue_1.createQueueMiddleware({ concurrency });
            const authMiddleware = sdk_middleware_auth_1.createAuthMiddlewareForClientCredentialsFlow({
                host: authHost,
                projectKey,
                fetch: node_fetch_1.default,
                credentials: { clientId, clientSecret },
            });
            this.headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
            this.request = () => api_request_builder_1.createRequestBuilder({ projectKey });
            this.client = sdk_client_1.createClient({ middlewares: [authMiddleware, httpMiddleware, queueMiddleware] });
            this.locale = locale;
            return this.client;
        });
    }
    resolveKeyAndVersion(keyOrEntity, fetchByKey) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (typeof keyOrEntity) {
                case 'object':
                    return new Promise(resolve => {
                        resolve({
                            key: keyOrEntity.key,
                            version: keyOrEntity.version,
                        });
                    });
                case 'string':
                    return fetchByKey(keyOrEntity)
                        .then((entity) => ({
                        key: keyOrEntity,
                        version: entity.version,
                    }));
                default:
                    throw new Error(`Invalid value for keyOrEntity: ${JSON.stringify(keyOrEntity)}`);
            }
        });
    }
    // --- Orders --- //
    fetchExpandedOrder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const uri = (this.request()
                .orders
                .byId(id)
                .expand('lineItems[*].productType')
                .expand('lineItems[*].supplyChannel')
                .expand('lineItems[*].distributionChannel')
                .expand('lineItems[*].variant.attributes[*].value')
                .expand('custom.fields.permissions')
                .build());
            const fetchRequest = {
                uri,
                method: 'GET',
                headers: this.headers,
            };
            return this.client.execute(fetchRequest).then(({ body: order }) => order);
        });
    }
    // --- Channels --- //
    fetchChannelByKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const fetchRequest = {
                uri: this.request().channels.where(`key="${key}"`).build(),
                method: 'GET',
                headers: this.headers,
            };
            return (this.client
                .execute(fetchRequest)
                .then(({ body: { results } }) => results[0])
                .catch(error => {
                console.dir(error, { depth: null });
                throw error;
            }));
        });
    }
    // --- CustomObjects --- //
    fetchCustomObject(container, key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const fetchRequest = {
                uri: this.request().customObjects.where(`container="${container}" and key="${key}"`).build(),
                method: 'GET',
                headers: this.headers,
            };
            return (this.client
                .execute(fetchRequest)
                .then(response => response.body.results[0]));
        });
    }
    saveCustomObject(customObjectDraft) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const postRequest = {
                uri: this.request().customObjects.build(),
                method: 'POST',
                headers: this.headers,
                body: customObjectDraft,
            };
            return (this.client
                .execute(postRequest)
                .then(response => response.body));
        });
    }
    // --- InventoryEntries --- //
    fetchInventoryEntry(sku, supplyChannelKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const channelRequest = {
                uri: this.request().channels.where(`key="${supplyChannelKey}"`).build(),
                method: 'GET',
                headers: this.headers,
            };
            const channel = yield this.client.execute(channelRequest).then(({ body: { results } }) => results[0]);
            const inventoryRequest = {
                uri: this.request().inventory.where(`sku="${sku}" and supplyChannel(typeId="channel" and id="${channel.id}")`).build(),
                method: 'GET',
                headers: this.headers,
            };
            return (this.client
                .execute(inventoryRequest)
                .then(({ body: { results } }) => results[0]));
        });
    }
    createInventoryEntry(inventoryEntryDraft) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const postRequest = {
                uri: this.request().inventory.build(),
                method: 'POST',
                headers: this.headers,
                body: inventoryEntryDraft,
            };
            return (this.client
                .execute(postRequest)
                .then(response => response.body));
        });
    }
    deleteInventoryEntry(id, version) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const deleteRequest = {
                uri: this.request().inventory.byId(id).withVersion(version).build(),
                method: 'DELETE',
                headers: this.headers,
            };
            return (this.client
                .execute(deleteRequest)
                .catch(error => {
                console.dir(error, { depth: null });
                throw error;
            }));
        });
    }
    // --- Products --- //
    fetchProductByEan(ean) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const fetchRequest = {
                uri: this.request().products.where(`masterData(current(masterVariant(attributes(name="ean" and value="${ean}"))))`).build(),
                method: 'GET',
                headers: this.headers,
            };
            return (this.client
                .execute(fetchRequest)
                .then(response => response.body.results[0]));
        });
    }
    fetchProductByProductCode(productCode) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const fetchRequest = {
                uri: this.request().products.where(`masterData(current(masterVariant(attributes(name="productCode" and value="${productCode}"))))`).build(),
                method: 'GET',
                headers: this.headers,
            };
            return (this.client
                .execute(fetchRequest)
                .then(response => response.body.results[0]));
        });
    }
    fetchProductByVariantSku(sku) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const fetchRequest = {
                uri: this.request().products.where(`masterData(current(masterVariant(sku="${sku}")))`).build(),
                method: 'GET',
                headers: this.headers,
            };
            return (this.client
                .execute(fetchRequest)
                .then(response => response.body.results[0]));
        });
    }
    createProduct(productDraft) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const postRequest = {
                uri: this.request().products.build(),
                method: 'POST',
                headers: this.headers,
                body: productDraft,
            };
            return (this.client
                .execute(postRequest)
                .then(response => response.body));
        });
    }
    // --- ProductTypes --- //
    fetchProductTypeByKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const fetchRequest = {
                uri: this.request().productTypes.byKey(key).build(),
                method: 'GET',
                headers: this.headers,
            };
            return this.client.execute(fetchRequest).then(response => response.body);
        });
    }
    updateProductType(keyOrProductType, actions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initClient();
            const { key, version } = yield this.resolveKeyAndVersion(keyOrProductType, this.fetchProductTypeByKey);
            const updateRequest = {
                uri: this.request().productTypes.byKey(key).withVersion(version).build(),
                method: 'POST',
                headers: this.headers,
                body: { version, actions },
            };
            return this.client.execute(updateRequest);
        });
    }
}
exports.Commercetools = Commercetools;
