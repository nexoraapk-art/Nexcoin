import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_MNEMONIC = process.env.ADMIN_VAULT_MNEMONIC || "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

app.post('/api/vault/login', (req, res) => {
  const { mnemonic } = req.body;
  if (mnemonic === ADMIN_MNEMONIC) {
    res.json({
      success: true,
      isVault: true,
      balance: "5000000000",
      tokens: [
        { symbol: "ETH", name: "Ethereum", balance: "1000000000", price: 2500, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
        { symbol: "USDC", name: "USD Coin", balance: "1000000000", price: 1, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" }
      ]
    });
  } else {
    res.status(403).json({ success: false, error: "Invalid mnemonic" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nexcoin backend running on port ${PORT}`));
