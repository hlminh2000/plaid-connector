import { Configuration, CountryCode, PlaidApi, Products } from "plaid";
import z from 'zod';

const RequestBodySchema = z.strictObject({
  PLAID_CLIENT_ID: z.string().min(1),
  PLAID_SECRET: z.string().min(1),
  PLAID_ACCESS_TOKEN: z.string().min(1).optional(),
  PLAID_PRODUCTS: z.array(z.nativeEnum(Products))
    .optional()
    .default([Products.Transactions]),
  PLAIID_COUNTRY_CODES: z.array(z.nativeEnum(CountryCode))
    .optional()
    .default([CountryCode.Ca])
})

export async function POST(request: Request) { 
  const { data, error } = RequestBodySchema.safeParse(await request.json());
  if(error) return Response.json(error)

  const {
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_ACCESS_TOKEN,
    PLAID_PRODUCTS,
    PLAIID_COUNTRY_CODES,
  } = data
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
    products: PLAID_PRODUCTS,
    country_codes: PLAIID_COUNTRY_CODES,
    language: 'en',
    access_token: PLAID_ACCESS_TOKEN
  })
  return Response.json(response.data)
}