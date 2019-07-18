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
  categories?: ResourceIdentifier[];
  categoryOrderHints?: CategoryOrderHints;
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  metaKeywords?: LocalizedString;
  masterVariant?: ProductVariantDraft;
  variants?: ProductVariantDraft[];
  taxCategory?: ResourceIdentifier;
  searchKeywords?: SearchKeywords;
  state?: Reference;
  publish?: boolean;
}

interface ProductVariantDraft {
  sku?: string;
  key?: string;
  prices?: PriceDraft[];
  images?: Image[];
  assets?: AssetDraft[];
  attributes?: Attribute[];
}

interface Asset {
  id: string;
  key?: string;
  sources: AssetSource[];
  name: LocalizedString;
  description?: LocalizedString;
  tags?: string[];
  custom?: CustomFields;
}

interface AssetDraft {
  key?: string;
  sources: AssetSource[];
  name: LocalizedString;
  description?: LocalizedString;
  tags?: string[];
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
  tiers?: PriceTier[];
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

type SuggestTokenizer = WhitespaceTokenizer | CustomTokenizer;

interface WhitespaceTokenizer {
  type: 'whitespace';
}

interface CustomTokenizer {
  type: 'custom';
  inputs: string[];
}

type CategoryOrderHints = any;

type ResourceIdentifier = ResourceIdentifierById | ResourceIdentifierByKey;

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
  categories: Reference[];
  description?: LocalizedString;
  slug: LocalizedString;
  masterVariant: ProductVariant;
  variants: ProductVariant[];
}

interface ProductVariant {
  id: number;
  sku?: string;
  key?: string;
  prices?: Price[];
  attributes?: Attribute[];
  price?: Price;
  images?: Image[];
  assets?: Asset[];
  availability?: ProductVariantAvailability;
  isMatchingVariant?: Boolean;
  scopedPrice?: ScopedPrice;
  scopedPriceDiscounted?: Boolean;
}

type DateTime = string;

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
  channels?: any; // Map of ProductVariantAvailability per Channel id
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
  version: number;
  createdAt: DateTime;
  createdBy: CreatedBy;
  lastModifiedAt: DateTime;
  lastModifiedBy: LastModifiedBy;
  name: string;
  description: string;
  attributes: AttributeDefinition[];
}

export interface ProductTypeDraft {
  name: string;
  key?: string;
  description: string;
  attributes: AttributeDefinitionDraft[];
}

export interface AddAttributeAction {
  action: string;
  attribute: AttributeDefinitionDraft;
}

export interface AttributeDefinitionDraft {
  type: AttributeType;
  name: string;
  label: LocalizedString;
  isRequired: boolean;
  isSearchable?: boolean;
}

export interface AttributeDefinition {
  type: AttributeType;
  name: string;
  label: LocalizedString;
  isRequired: boolean;
  attributeConstraint: AttributeConstraint;
  inputTip?: LocalizedString;
  inputHint: TextInputHint;
  isSearchable: boolean;
}

export type AttributeConstraint = 'None' | 'Unique' | 'CombinationUnique' | 'SameForAll';

export interface AttributeType {
  name: string;
}

export interface PagedQueryResult {
  offset: number;
  limit: number;
  count: number;
  total?: number;
  results: any[];
  // facets?: FacetResults;
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
  rates: TaxRate[];
}

export interface TaxCategoryDraft {
  name: string;
  key?: string;
  description?: string;
  rates: TaxRateDraft[];
}

export interface TaxRateDraft {
  name: string;
  amount?: number;
  includedInPrice: boolean;
  country: string;
  state?: string;
  subRates?: SubRate[];
}

export interface SubRate {
  name: string;
  amount: number; // Percentage in the range of [0..1]
}

export interface TaxRate {
  id?: string;
  name: string;
  amount: number; // Percentage in the range of [0..1]
  includedInPrice: boolean;
  country: string; // A two-digit country code as per ↗ ISO 3166-1 alpha-2
  state?: string; // The state in the country
}

export interface CustomObjectDraft {
  container: string; // matching the pattern [-_~.a-zA-Z0-9]+
  key: string; // matching the pattern [-_~.a-zA-Z0-9]+
  value: any; // JSON types Number, string, Boolean, Array, Object
  version?: number;
}

export interface CustomObject {
  id: string;
  createdAt: DateTime;
  lastModifiedAt: DateTime;
  container: string; // matching the pattern [-_~.a-zA-Z0-9]+
  key: string; // matching the pattern [-_~.a-zA-Z0-9]+
  value: any; // JSON types Number, string, Boolean, Array, Object
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
  key: string; // unique within the project | Any arbitrary string key that uniquely identifies this channel within the project.
  roles: ChannelRole[]; // The roles of this channel. Each channel must have at least one role.
  name?: LocalizedString; // A human-readable name of the channel.
  description?: LocalizedString; // A human-readable description of the channel.
  address?: Address; // The address where this channel is located (e.g. if the channel is a physical store).
  reviewRatingStatistics?: ReviewRatingStatistics; // Statistics about the review ratings taken into account for this channel.
  custom?: CustomFields;
}

export interface ChannelDraft {
  key: string;
  roles?: ChannelRole[]; // If not specified, then channel will get InventorySupply role by default
  name?: LocalizedString;
  description?: LocalizedString;
  address?: Address;
  custom?: CustomFieldsDraft;
}

type ChannelRole = 'InventorySupply' | 'ProductDistribution' | 'OrderExport' | 'OrderImport' | 'Primary';

interface Address {
  country: string; // A two-digit country code as per ↗ ISO 3166-1 alpha-2 .
  id?: string;
  key?: string; // if given it must match [a-zA-Z0-9_\-]{2,256}
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
  averageRating: number; // Average rating of one target. This number is rounded with 5 decimals.
  highestRating: number; // Highest rating of one target
  lowestRating: number; // Lowest rating of one target
  count: number; // Number of ratings taken into account
  ratingsDistribution: any; // JSON object. The full distribution of the ratings. The keys are the different ratings and the values are the count of reviews having this rating. Only the used ratings appear in this object.
}

export interface Category {
  id: string;
  key?: string;
  version: number;
  createdAt: DateTime;
  createdBy: CreatedBy;
  lastModifiedAt: DateTime;
  lastModifiedBy: LastModifiedBy;
  name: LocalizedString;
  slug: LocalizedString;
  description?: LocalizedString;
  ancestors: Reference[];
  parent?: Reference;
  orderHint: string;
  externalId?: string;
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  metaKeywords?: LocalizedString;
  custom?: CustomFields;
  assets?: Asset[];
}

export interface CreatedBy {
  clientId?: string;
  externalUserId?: string;
  customer?: Reference;
  anonymousId?: string;
}

export interface LastModifiedBy {
  clientId?: string;
  externalUserId?: string;
  customer?: Reference;
  anonymousId?: string;
}

export interface CustomTypeDraft {
  key: string;
  name: LocalizedString;
  description?: LocalizedString;
  resourceTypeIds: string[];
  fieldDefinitions?: FieldDefinition[];
}

export interface CustomType {
  id: string;
  key: string;
  version: number;
  createdAt: DateTime;
  createdBy: CreatedBy;
  lastModifiedAt: DateTime;
  lastModifiedBy: LastModifiedBy;
  name: LocalizedString;
  description?: LocalizedString;
  resourceTypeIds: string[];
  fieldDefinitions: FieldDefinition[];
}

export interface FieldDefinition {
  type: FieldType;
  name: string;
  label: LocalizedString;
  required: boolean;
  inputHint: TextInputHint;
}

export interface FieldType {
  name: string;
  values?: any[];
  elementType?: FieldType;
  referenceTypeId?: 'cart' | 'category' | 'channel' | 'customer' | 'key-value-document' | 'order' | 'product' | 'product-type' | 'review' | 'state' | 'shipping-method' | 'zone';
}

export type TextInputHint = 'SingleLine' | 'MultiLine'

export interface Extension {
  id: string;
  key?: string;
  version: number;
  createdAt: DateTime;
  createdBy: CreatedBy;
  lastModifiedAt: DateTime;
  lastModifiedBy: LastModifiedBy;
  destination: Destination;
  triggers: Trigger[];
  timeoutInMs?: number;
}

export interface ExtensionDraft {
  key?: string;
  destination: Destination;
  triggers: Trigger[];
  timeoutInMs?: number;
}

export type Destination = HttpDestination | AwsLambdaDestination;

export interface HttpDestination {
  type:"HTTP";
  url: string;
  authentication?: HttpDestinationAuthentication;
}

export interface AwsLambdaDestination {
  type: "AWSLambda";
  arn: string;
  accessKey: string;
  accessSecret: string;
}

export type HttpDestinationAuthentication = AuthorizationHeader | AzureFunctionsAuthentication;

export interface AuthorizationHeader {
  type: 'AuthorizationHeader';
  headerValue: string;
}

export interface AzureFunctionsAuthentication {
  type: 'AzureFunctions';
  key: string;
}

export interface Trigger {
  resourceTypeId: 'cart' | 'order' | 'payment' | 'customer';
  actions: Array<'Create' | 'Update'>;
}

export interface SubscriptionDraft {
  key?: string;
  destination: Destination;
  messages?: MessageSubscription[];
  changes?: ChangeSubscription[];
  format?: Format;
}

export interface Subscription {
  id: string;
  key?: string;
  version: number;
  createdAt: DateTime;
  createdBy: CreatedBy;
  lastModifiedAt: DateTime;
  lastModifiedBy: LastModifiedBy;
  destination: Destination;
  messages: MessageSubscription[];
  changes: ChangeSubscription[];
  format: Format;
  status: SubscriptionHealthStatus;
}

export interface MessageSubscription {
  resourceTypeId: string;
  types?: string[];
}

export interface ChangeSubscription {
  resourceTypeId: 'cart' | 'cart-discount' | 'category' | 'channel' | 'customer' | 'customer-group' | 'discount-code' | 'extension' | 'inventory-entry' | 'order' | 'payment' | 'product' | 'product-discount' | 'product-type' | 'review' | 'shopping-list' | 'subscription' | 'state' | 'tax-category' | 'type';
}

export type Format = PlatformFormat | CloudEventsFormat;

export interface PlatformFormat {
  type: 'Platform';
}

export interface CloudEventsFormat {
  type: 'CloudEvents';
  cloudEventsVersion: '0.1';
}

export type SubscriptionHealthStatus = 'Healthy' | 'ConfigurationError' | 'ConfigurationErrorDeliveryStopped' | 'TemporaryError'

// Order update actions

export type UpdateOrderAction = ChangeOrderStateAction;

export type OrderState = 'Open' | 'Confirmed' | 'Completed' | 'Cancelled';
export interface ChangeOrderStateAction {
  action: "changeOrderState"
  orderState: OrderState;
}

export type Sort = SortStatement[];

export interface SortStatement {
  by: string;
  direction: 'asc' | 'desc';
}
