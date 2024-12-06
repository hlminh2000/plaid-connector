import { Configuration, CountryCode, PlaidApi, Products } from "plaid";

export async function POST(request: Request) { 
  const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ACCESS_TOKEN } = await request.json();
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

  const response = await client.linkTokenCreate({
    user: {
      client_user_id: 'user-id',
    },
    client_name: 'Plaid Quickstart',
    products: [Products.Transactions],
    country_codes: [CountryCode.Ca],
    language: 'en',
    access_token: PLAID_ACCESS_TOKEN
  })
  console.log("response: ", response)
  return Response.json(response.data)
}