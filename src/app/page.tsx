"use client"
import { usePlaidLink, PlaidLink } from 'react-plaid-link';
import { Box, Button, Card, CardContent, CardHeader, Container, Divider, Grid2, List, ListItem, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { PlaidApi } from "plaid";
import { metadata } from './layout';

type PlaidConnectionData = Awaited<ReturnType<PlaidApi["itemPublicTokenExchange"]>>['data']

export default function Home() {
  const [PLAID_CLIENT_ID, set_PLAID_CLIENT_ID] = useState("");
  const [PLAID_SECRET, set_PLAID_SECRET] = useState("");
  const [PLAID_ACCESS_TOKEN, set_PLAID_ACCESS_TOKEN] = useState("");

  const [plaidConnectionData, setPlaidConnectionData] = useState<PlaidConnectionData | null>(null)

  const [PLAID_LINK_TOKEN, set_PLAID_LINK_TOKEN] = useState("");
  const { open, ready, exit, submit, error } = usePlaidLink({
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
  useEffect(() => {
    console.log(error)
  }, [error])

  const onConnectClick = async () => {
    const response = await fetch("/api/link", {
      method: "POST",
      body: JSON.stringify({ PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ACCESS_TOKEN: PLAID_ACCESS_TOKEN || undefined })
    }).then(res => res.json()) as Awaited<ReturnType<PlaidApi["linkTokenCreate"]>>['data']
    set_PLAID_LINK_TOKEN(response.link_token)
  }

  useEffect(() => {
    if (PLAID_LINK_TOKEN && ready) {
      console.log("PLAID_LINK_TOKEN: ", PLAID_LINK_TOKEN)
      open();
    }
  }, [PLAID_LINK_TOKEN, ready, open])

  return (
    <div>
      <main>
        <Container style={{ height: "100vh" }}>
          <Box display={"flex"} justifyContent={"center"} alignItems={"center"} height={"100%"}>
            <Card sx={{width: 500, maxWidth: "100%"}}>
              <CardHeader title="Plaid Connector" />
              <Divider />
              <List>
                <ListItem>
                  <TextField fullWidth required size="small" label="CLIENT_ID" value={PLAID_CLIENT_ID} onChange={e => set_PLAID_CLIENT_ID(e.target.value)} />
                </ListItem>
                <ListItem>
                  <TextField fullWidth required size="small" label="SECRET" value={PLAID_SECRET} onChange={e => set_PLAID_SECRET(e.target.value)} />
                </ListItem>
                <ListItem>
                  <TextField fullWidth size="small" label="ACCESS_TOKEN" value={PLAID_ACCESS_TOKEN} onChange={e => set_PLAID_ACCESS_TOKEN(e.target.value)} />
                </ListItem>
                <ListItem>
                  <Button variant="outlined" onClick={onConnectClick} fullWidth>Connect</Button>
                </ListItem>
              </List>
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
            </Card>
          </Box>
        </Container>
      </main>
    </div>
  );
}
