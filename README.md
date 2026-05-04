# 🕵️‍♂️ Ads Analyzer
**Real-time Facebook Ads Intelligence for Sri Lanka.**

Ads Analyzer is a lightweight, high-performance tool designed to help marketers and entrepreneurs spot trending ads, analyze competitor strategies, and identify profitable ad angles in real-time using the Meta Ad Library.

---

## 🚀 Features
- **AI Intent Engine (Groq)**: Describe your goal in natural language (e.g., "sell cheap AWS courses") and let AI handle the search strategy.
- **Winning Strategy Generator**: AI analyzes scraped ads to recommend hooks, CTA, and pricing strategies.
- **AI Ad Copy Generator**: Generate high-converting Facebook ad copy with a single click.
- **Real-time Ad Scraping**: Automatically fetches active ads from Meta Ad Library.
- **Market Saturation Meter**: Visual indicator of competition levels for your chosen niche.
- **Data Persistence (MongoDB Atlas)**: Stores searches and trends for historical analysis.
- **Success Indicators**: Marks ads running for more than 7 days as "Probably Profitable."

---

## 🛠 Tech Stack
- **AI**: [Groq AI](https://groq.com/) (Llama 3 70B)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Frontend**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Scraper**: [Playwright](https://playwright.dev/)

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/AsithaLKonara/ads-analyser.git
cd ads-analyser
```

### 2. Setup Frontend
```bash
npm install
```

### 3. Setup Backend
```bash
cd server
npm install
npx playwright install chromium
```

---

## 🚦 Usage

### 1. Start the Backend Server
```bash
# In the /server directory
node index.js
```
The backend will run at `http://localhost:3001`.

### 2. Start the Frontend Application
```bash
# In the root directory
npm run dev
```
Visit `http://localhost:5173` to start analyzing ads!

---

## 📂 Project Structure
```text
Ads Analyzer/
├── server/             # Node.js backend
│   ├── scraper.js      # Playwright scraping logic
│   ├── index.js        # Express API endpoints
│   └── .env            # Environment variables
├── src/                # React frontend
│   ├── App.jsx         # Main dashboard logic
│   ├── index.css       # Premium design system
│   └── main.jsx        # App entry point
└── package.json        # Frontend dependencies
```

---

## 🗺 Roadmap
- [ ] **Multi-Country Support**: Expand beyond Sri Lanka.
- [ ] **Data Persistence**: Store searches in Firebase/MongoDB.
- [ ] **Export Options**: Download ad data as CSV or PDF reports.
- [ ] **Creative Analysis**: Deep-link to original ad creatives.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact
**Asitha L Konara**  
Project Link: [https://github.com/AsithaLKonara/ads-analyser](https://github.com/AsithaLKonara/ads-analyser)
