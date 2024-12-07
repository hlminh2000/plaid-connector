"use client"
import { usePlaidLink } from 'react-plaid-link';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Container,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import { CountryCode, PlaidApi, Products } from "plaid";

type PlaidConnectionData = Awaited<ReturnType<PlaidApi["itemPublicTokenExchange"]>>['data']

export default function Home() {
  const [PLAID_CLIENT_ID, set_PLAID_CLIENT_ID] = useState("");
  const [PLAID_SECRET, set_PLAID_SECRET] = useState("");
  const [PLAID_ACCESS_TOKEN, set_PLAID_ACCESS_TOKEN] = useState("");
  const [PLAID_PRODUCTS, set_PLAID_PRODUCTS] = useState([Products.Transactions]);
  const [PLAID_COUNTRY_CODES, set_PLAID_COUNTRY_CODES] = useState([CountryCode.Ca, CountryCode.Us]);

  const [loadingLinkToken, setLoadingLinkToken] = useState(false);
  const theme = useTheme();

  const [plaidConnectionData, setPlaidConnectionData] = useState<PlaidConnectionData | null>(null)

  const [PLAID_LINK_TOKEN, set_PLAID_LINK_TOKEN] = useState("");
  const { open, ready } = usePlaidLink({
    token: PLAID_LINK_TOKEN,
    onEvent: (event, metadata) => {
      console.log("===============")
      console.log(event, metadata)
    },
    onSuccess: async (public_token, metadata) => {
      const response = await fetch("/api/access_token", {
        method: "POST",
        body: JSON.stringify({ PLAID_CLIENT_ID, PLAID_SECRET, PUBLIC_TOKEN: public_token })
      }).then(res => res.json()) as Awaited<ReturnType<PlaidApi["itemPublicTokenExchange"]>>['data']
      setPlaidConnectionData(response)
    },
  });

  const onConnectClick = async () => {
    setLoadingLinkToken(true)
    const response = await fetch("/api/link", {
      method: "POST",
      body: JSON.stringify({ PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ACCESS_TOKEN: PLAID_ACCESS_TOKEN || undefined })
    }).then(res => res.json()).catch(err => null) as Awaited<ReturnType<PlaidApi["linkTokenCreate"]>>['data'] | null
    
    if (!response?.link_token) {
      setLoadingLinkToken(false)
      return alert('Could not generate a Plaid link_token')
    }

    return set_PLAID_LINK_TOKEN(response.link_token)
  }

  useEffect(() => {
    if (PLAID_LINK_TOKEN && ready) {
      open();
      setLoadingLinkToken(false)
    }
  }, [PLAID_LINK_TOKEN, ready, open])


  return (
    <div>
      <main>
        <Container style={{ height: "100vh" }}>
          <Box display={"flex"} justifyContent={"center"} alignItems={"center"} height={"100%"}>
            <Card sx={{ width: 500, maxWidth: "100%" }}>
              <CardHeader title="Plaid Connector" subheader="Generate a Plaid access_token" />
              <Divider />
              <List>
                <ListItem>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="CLIENT_ID" 
                    value={PLAID_CLIENT_ID} 
                    onChange={e => set_PLAID_CLIENT_ID(e.target.value)} 
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="SECRET" 
                    value={PLAID_SECRET} 
                    onChange={e => set_PLAID_SECRET(e.target.value)} 
                    type="password"
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    fullWidth
                    size="small"
                    label="ACCESS_TOKEN (optional)" 
                    value={PLAID_ACCESS_TOKEN} 
                    onChange={e => set_PLAID_ACCESS_TOKEN(e.target.value)} 
                    type="password"
                  />
                </ListItem>
                <ListItem>
                  <FormControl fullWidth>
                    <InputLabel id="products_select_label">Products</InputLabel>
                    <Select
                      labelId="products_select_label"
                      fullWidth
                      size='small'
                      multiple
                      value={PLAID_PRODUCTS}
                      onChange={e => set_PLAID_PRODUCTS(e.target.value as Products[])}
                      input={<OutlinedInput id="select-products" label="Products" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {PLAID_PRODUCTS.map((value) => (
                            <Chip key={value} label={value} size='small' />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(Products).map((value) => (
                        <MenuItem
                          key={value}
                          value={value}
                          style={{
                            fontWeight: PLAID_PRODUCTS.includes(value)
                              ? theme.typography.fontWeightMedium
                              : theme.typography.fontWeightRegular,
                          }}
                        >
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>
                <ListItem>
                  <FormControl fullWidth>
                    <InputLabel id="country_code_select_label">Products</InputLabel>
                    <Select
                      labelId="country_code_select_label"
                      fullWidth
                      size='small'
                      multiple
                      value={PLAID_COUNTRY_CODES}
                      onChange={e => set_PLAID_COUNTRY_CODES(e.target.value as CountryCode[])}
                      input={<OutlinedInput id="select-CountryCode" label="CountryCode" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {PLAID_COUNTRY_CODES.map((value) => (
                            <Chip key={value} label={value} size='small' />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(CountryCode).map((value) => (
                        <MenuItem
                          key={value}
                          value={value}
                          style={{
                            fontWeight: PLAID_COUNTRY_CODES.includes(value)
                              ? theme.typography.fontWeightMedium
                              : theme.typography.fontWeightRegular,
                          }}
                        >
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>
                <ListItem>
                  <Button variant="outlined" onClick={onConnectClick} fullWidth disabled={loadingLinkToken}>Connect</Button>
                </ListItem>
              </List>
              {plaidConnectionData && <>
                <Divider />
                <List>
                  <ListItem>
                    <Typography>access_token: {plaidConnectionData?.access_token}</Typography>
                  </ListItem>
                  <ListItem>
                    <Typography>item_id: {plaidConnectionData?.item_id}</Typography>
                  </ListItem>
                  <ListItem>
                    <Typography>request_id: {plaidConnectionData?.request_id}</Typography>
                  </ListItem>
                </List>
              </>}
            </Card>
          </Box>
        </Container>
      </main>
    </div>
  );
}
