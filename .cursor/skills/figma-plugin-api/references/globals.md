# Globals

Global variables and fetch available in the plugin context.

## __html__

If manifest `"ui"` is a filename (string), `__html__` contains that file's contents.

```ts
figma.showUI(__html__);
```

## __uiFiles__

If manifest `"ui"` is a map:

```json
"ui": { "main": "main.html", "secondary": "secondary.html" }
```

Then `__uiFiles__.main`, `__uiFiles__.secondary` contain each file's contents.

```ts
figma.showUI(__uiFiles__.main);
```

## fetch(url: string, init?: FetchOptions): Promise\<FetchResponse\>

Network fetch. Similar to standard fetch; some differences in options/response.

```ts
interface FetchOptions {
  method?: string;
  headers?: { [name: string]: string };
  body?: Uint8Array | string;
  credentials?: string;
  cache?: string;
  redirect?: string;
  referrer?: string;
  integrity?: string;
}

interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headersObject: { [name: string]: string };
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json(): Promise<any>;
  // ...url, redirected, type
}
```
