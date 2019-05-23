export interface Entity {
    key: string;
    version: number;
}
export interface Product {
    id: string;
    key?: string;
    version: number;
    createdAt: DateTime;
    lastModifiedAt: DateTime;
    productType: Reference;
    masterData: ProductCatalogData;
    taxCategory?: Reference;
    state?: Reference;
}
export interface ProductDraft {
    key?: string;
    name: LocalizedString;
    productType: ResourceIdentifier;
    slug: LocalizedString;
    description?: LocalizedString;
    categories?: Array<ResourceIdentifier>;
    categoryOrderHints?: CategoryOrderHints;
    metaTitle?: LocalizedString;
    metaDescription?: LocalizedString;
    metaKeywords?: LocalizedString;
    masterVariant?: ProductVariantDraft;
    variants?: Array<ProductVariantDraft>;
    taxCategory?: ResourceIdentifier;
    searchKeywords?: SearchKeywords;
    state?: Reference;
    publish?: boolean;
}
interface ProductVariantDraft {
    sku?: string;
    key?: string;
    prices?: Array<PriceDraft>;
    images?: Array<Image>;
    assets?: Array<AssetDraft>;
    attributes?: Array<Attribute>;
}
interface Asset {
    id: string;
    key?: string;
    sources: Array<AssetSource>;
    name: LocalizedString;
    description?: LocalizedString;
    tags?: Array<string>;
    custom?: CustomFields;
}
interface AssetDraft {
    key?: string;
    sources: Array<AssetSource>;
    name: LocalizedString;
    description?: LocalizedString;
    tags?: Array<string>;
    custom?: CustomFieldsDraft;
}
interface AssetSource {
    uri: string;
    key?: string;
    dimensions?: AssetDimensions;
    contentType?: string;
}
interface CustomFieldsDraft {
    type: ResourceIdentifier;
    fields?: any;
}
interface PriceDraft {
    value: BaseMoney;
    country?: string;
    customerGroup?: Reference;
    channel?: ResourceIdentifier;
    validFrom?: DateTime;
    validUntil?: DateTime;
    tiers?: Array<PriceTier>;
    custom?: CustomFieldsDraft;
}
interface PriceTier {
    minimumQuantity: number;
    value: BaseMoney;
}
interface SearchKeywords {
    text: string;
    suggestTokenizer?: SuggestTokenizer;
}
declare type SuggestTokenizer = WhitespaceTokenizer | CustomTokenizer;
interface WhitespaceTokenizer {
    type: 'whitespace';
}
interface CustomTokenizer {
    type: 'custom';
    inputs: Array<string>;
}
declare type CategoryOrderHints = any;
declare type ResourceIdentifier = ResourceIdentifierById | ResourceIdentifierByKey;
interface ResourceIdentifierById {
    id: string;
    typeId?: string;
}
interface ResourceIdentifierByKey {
    key: string;
    typeId?: string;
}
interface Reference {
    typeId: string;
    id: string;
}
interface ProductCatalogData {
    published: Boolean;
    current: ProductData;
    staged: ProductData;
    hasStagedChanges: Boolean;
}
interface ProductData {
    name: LocalizedString;
    categories: Array<Reference>;
    description?: LocalizedString;
    slug: LocalizedString;
    masterVariant: ProductVariant;
    variants: Array<ProductVariant>;
}
interface ProductVariant {
    id: number;
    sku?: string;
    key?: string;
    prices?: Array<Price>;
    attributes?: Array<Attribute>;
    price?: Price;
    images?: Array<Image>;
    assets?: Array<Asset>;
    availability?: ProductVariantAvailability;
    isMatchingVariant?: Boolean;
    scopedPrice?: ScopedPrice;
    scopedPriceDiscounted?: Boolean;
}
declare type DateTime = string;
interface Price {
    id: string;
    value: BaseMoney;
    country?: string;
    customerGroup?: Reference;
    channel?: Reference;
    validFrom?: DateTime;
    validUntil?: DateTime;
    discounted?: DiscountedPrice;
    custom?: CustomFields;
}
interface BaseMoney {
    type: string;
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
}
interface DiscountedPrice {
    value: Money;
    discount: Reference;
}
interface Money {
    type: string;
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
}
interface CustomFields {
    type: Reference;
    fields: any;
}
interface Attribute {
    name: string;
    value: any;
}
interface Image {
    url: string;
    dimensions: AssetDimensions;
    label?: string;
}
interface AssetDimensions {
    w: number;
    h: number;
}
interface ProductVariantAvailability {
    isOnStock?: Boolean;
    restockableInDays?: number;
    availableQuantity?: number;
    channels?: any;
}
interface ScopedPrice {
    id: string;
    value: BaseMoney;
    currentValue: BaseMoney;
    country?: string;
    customerGroup?: Reference;
    channel?: Reference;
    validFrom?: DateTime;
    validUntil?: DateTime;
    discounted?: DiscountedPrice;
    custom?: CustomFields;
}
interface LocalizedString {
    [locale: string]: string;
}
export interface ProductType {
    id: string;
    key?: string;
}
export interface AddAttributeAction {
    action: string;
    attribute: AttributeDefinitionDraft;
}
interface AttributeDefinitionDraft {
    type: AttributeType;
    name: string;
    label: LocalizedString;
    isRequired: boolean;
    isSearchable?: boolean;
}
interface AttributeType {
    name: string;
}
export interface PagedQueryResult {
    offset: number;
    limit: number;
    count: number;
    total?: number;
    results: Array<any>;
    meta?: any;
}
export interface TaxCategory {
    id: string;
    key?: string;
    version: number;
    createdAt: DateTime;
    lastModifiedAt: DateTime;
    name: string;
    description?: string;
    rates: Array<TaxRate>;
}
interface TaxRate {
    id?: string;
    name: string;
    amount: number;
    includedInPrice: boolean;
    country: string;
    state?: string;
}
export interface CustomObjectDraft {
    container: string;
    key: string;
    value: any;
    version?: number;
}
export interface CustomObject {
    id: string;
    createdAt: DateTime;
    lastModifiedAt: DateTime;
    container: string;
    key: string;
    value: any;
    version: number;
}
export interface InventoryEntry {
    id: string;
    version: number;
    createdAt: DateTime;
    lastModifiedAt: DateTime;
    sku: string;
    supplyChannel?: Reference;
    quantityOnStock: number;
    availableQuantity: number;
    restockableInDays?: number;
    expectedDelivery?: DateTime;
    custom?: CustomFields;
}
export interface InventoryEntryDraft {
    sku: string;
    quantityOnStock: number;
    restockableInDays?: number;
    expectedDelivery?: DateTime;
    supplyChannel?: ResourceIdentifier;
    custom?: CustomFieldsDraft;
}
export interface Channel {
    id: string;
    version: number;
    createdAt: DateTime;
    lastModifiedAt: DateTime;
    key: string;
    roles: Array<ChannelRole>;
    name?: LocalizedString;
    description?: LocalizedString;
    address?: Address;
    reviewRatingStatistics?: ReviewRatingStatistics;
    custom?: CustomFields;
}
export interface ChannelDraft {
    key: string;
    roles?: Array<ChannelRole>;
    name?: LocalizedString;
    description?: LocalizedString;
    address?: Address;
    custom?: CustomFieldsDraft;
}
declare type ChannelRole = 'InventorySupply' | 'ProductDistribution' | 'OrderExport' | 'OrderImport' | 'Primary';
interface Address {
    country: string;
    id?: string;
    key?: string;
    title?: string;
    salutation?: string;
    firstName?: string;
    lastName?: string;
    streetName?: string;
    streetNumber?: string;
    additionalStreetInfo?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    state?: string;
    company?: string;
    department?: string;
    building?: string;
    apartment?: string;
    pOBox?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    fax?: string;
    additionalAddressInfo?: string;
    externalId?: string;
}
interface ReviewRatingStatistics {
    averageRating: number;
    highestRating: number;
    lowestRating: number;
    count: number;
    ratingsDistribution: any;
}
export {};
