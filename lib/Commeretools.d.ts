import { AddAttributeAction, Channel, CustomObject, CustomObjectDraft, Entity, InventoryEntry, InventoryEntryDraft, Product, ProductDraft, ProductType } from './types';
interface ICommercetoolsConfig {
    projectKey: string;
    clientId: string;
    clientSecret: string;
    locale: string;
    concurrency: number;
    authHost: string;
    apiHost: string;
}
export declare class Commercetools {
    locale: string | undefined;
    private readonly getConfig;
    private client;
    private request;
    private headers;
    constructor(getConfig: () => Promise<ICommercetoolsConfig>);
    initClient(): Promise<any>;
    resolveKeyAndVersion(keyOrEntity: string | Entity, fetchByKey: Function): Promise<Entity>;
    fetchExpandedOrder(id: string): Promise<any>;
    fetchChannelByKey(key: string): Promise<Channel>;
    fetchCustomObject(container: string, key: string): Promise<CustomObject>;
    saveCustomObject(customObjectDraft: CustomObjectDraft): Promise<CustomObject>;
    fetchInventoryEntry(sku: string, supplyChannelKey: string): Promise<InventoryEntry>;
    createInventoryEntry(inventoryEntryDraft: InventoryEntryDraft): Promise<InventoryEntry>;
    deleteInventoryEntry(id: string, version: number): Promise<void>;
    fetchProductByEan(ean: string): Promise<Product>;
    fetchProductByProductCode(productCode: string): Promise<Product>;
    fetchProductByVariantSku(sku: string): Promise<Product>;
    createProduct(productDraft: ProductDraft): Promise<Product>;
    fetchProductTypeByKey(key: String): Promise<ProductType>;
    updateProductType(keyOrProductType: any, actions: AddAttributeAction[]): Promise<void>;
}
export {};
