```typescript
import { Commercetools } from 'multi-commercetools';

interface CommercetoolsConfig {
  projectKey: string,
  clientId: string,
  clientSecret: string,
  locale: string,
  concurrency: number,
  authHost: string,
  apiHost: string,
}

interface PagedQueryResult {
  offset: number;
  limit: number;
  count: number;
  total?: number;
  results: any[];
  // facets?: FacetResults;
  meta?: any;
}

async function getConfig(): Promise<CommercetoolsConfig> {
  // ...
}

const commercetools = new Commercetools(getConfig);

commercetools.fetchExpandedOrders(1, 10).then((data: PagedQueryResult) => {
  console.info(data);
});
```
