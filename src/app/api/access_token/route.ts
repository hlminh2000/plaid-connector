import { Configuration, PlaidApi } from "plaid";
import z from 'zod';

const RequestBodySchema = z.strictObject({
  PLAID_CLIENT_ID: z.string().min(1),
  PLAID_SECRET: z.string().min(1),
  PUBLIC_TOKEN: z.string().min(1),
})

export async function POST(request: Request) {
  const { data, error } = RequestBodySchema.safeParse(await request.json());
  if (error) return Response.json(error)

  const { PLAID_CLIENT_ID, PLAID_SECRET, PUBLIC_TOKEN } = data
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
