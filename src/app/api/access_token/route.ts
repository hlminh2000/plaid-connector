import { Configuration, CountryCode, PlaidApi, Products } from "plaid";

export async function POST(request: Request) {
  const { PLAID_CLIENT_ID, PLAID_SECRET, PUBLIC_TOKEN } = await request.json();
  const client = new PlaidApi(new Configuration({
    basePath: "https://production.plaid.com",
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
        'Plaid-Version': '2020-09-14',
      },
    },
  }));

  const response = await client.itemPublicTokenExchange({
    public_token: PUBLIC_TOKEN,
  })
  return Response.json(response.data)
}
