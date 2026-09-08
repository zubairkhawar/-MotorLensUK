# MotorLens UK — Simple Presentation Script

**Duration:** ~10 minutes + Q&A
**Style:** Conversational, plain English, no jargon dumps

---

## Before you start (30 seconds)

Open these tabs in your browser:
1. `http://localhost:3000` — Dashboard
2. `http://localhost:3000/scrape` — Scrape console
3. `http://localhost:3000/listings` — Listings
4. `http://localhost:3000/cleaning` — Cleaning
5. `http://localhost:3000/eda` — EDA charts

Run `./start.sh` in your terminal 10 minutes before class.

---

## 1. Introduction (1 minute)

> "Good morning everyone. Our project is called **MotorLens UK**.
>
> The assignment brief asks us to build a system for a market intelligence company that wants insights into the British used-car market — things like how prices change, which models are popular, and which fuel types are selling.
>
> So that's what we built. **MotorLens UK is a web application** that collects real car listings from UK websites, cleans up the data, and shows the insights on interactive charts.
>
> Let me walk you through it."

**→ Show the Dashboard page (`/`)**

> "This is what the user sees when they open the app. You can see we have **113 real UK car listings** in the system right now, across **24 different car makes**. The median price is around £1,850. That's the summary."

---

## 2. What we built — quick overview (1 minute)

> "The project has two main parts.
>
> The **first part** collects the data from the internet. We used **three different scraping tools** to get listings from three UK car websites — AutoTrader, Cinch, and Heycar. The assignment asks for at least two tools, we used three.
>
> The **second part** is this dashboard you're looking at. It takes the collected data, cleans it up, and shows it in a way that's actually useful.
>
> Let me show you each piece."

---

## 3. Scraping — the data collection (2 minutes)

**→ Click on "Scrape" in the sidebar**

> "This is the scrape console. You can see three cards — one for each website we collect data from.
>
> Each card uses a different tool:
> - **AutoTrader** uses BeautifulSoup — that's for reading regular web pages
> - **Cinch** uses Playwright — that's a tool that opens a real browser in the background
> - **Heycar** uses the Requests library — that's for making simple web requests
>
> Now, here's an interesting problem we ran into. Big websites like AutoTrader don't want people scraping them. So they block automated requests. We had to solve that.
>
> The way we solved it is by using a service called **ScrapingBee**. Think of it like a middleman — we send them a website URL, and they fetch the page for us using real UK internet connections that the websites don't block. It costs a small fee per request, but it works.
>
> Down here you can see the recent jobs table — every time we run a scraper, it logs how many listings it collected, how long it took, and whether it worked."

**Important:** Do NOT click Run during the demo — say:

> "I won't click Run now because our data is already loaded from earlier — but if I did, it would take about 20 seconds and add fresh listings."

---

## 4. Listings — the data (1.5 minutes)

**→ Click "Listings" in the sidebar**

> "This is where you can browse every car we collected. Each card shows a real UK car listing — the make, the model, the price, the year, the mileage, the fuel type, and where the dealer is based.
>
> The pictures are real photos of each model, pulled from Wikipedia.
>
> The important thing here is the **filters at the top**. Let me show you.
>
> If I want to see only Ford cars…"

**→ Click the Make dropdown, select "Ford", click Apply**

> "There we go — only Fords now.
>
> Or if I want cars under £5,000…"

**→ Type 5000 in the max price box, click Apply**

> "Now only cheaper cars appear.
>
> All these filters work with the backend. The filtering happens in the database — it's fast and accurate."

**→ Click "Clear all" to reset**

---

## 5. Cleaning — making the data usable (1.5 minutes)

**→ Click "Cleaning" in the sidebar**

> "Raw data from websites is always messy. Prices come in weird formats. Fuel types might be spelled 'petrol' or 'Petrol' or 'PETROL'. Some listings have missing values. So we need to clean it up.
>
> Our cleaning process has **six steps**, shown here at the top:
>
> 1. Load the raw data
> 2. Remove duplicates
> 3. Convert everything to the right data type — like turning '£12,050' into the number 12050
> 4. Standardise the categories — so 'petrol' and 'Petrol' become the same thing
> 5. Fill in missing regions where we can
> 6. Handle extreme outliers — for example if someone lists a car for £999,999 by accident
>
> Down here you can see the report. It shows how many rows we started with, how many we ended with, how many duplicates we removed, and which columns had missing values before and after.
>
> And this button here…"

**→ Point at "Export CSV" button**

> "…lets us download the cleaned data as a CSV file — which is one of the required deliverables for the assignment."

---

## 6. EDA — the insights (2 minutes)

**→ Click "EDA" in the sidebar**

> "EDA stands for Exploratory Data Analysis. It's how we find patterns in the data.
>
> We've got **seven different charts** here. Let me quickly walk through each one:
>
> **First chart** — price distribution. Shows the range of prices in the market. Most cars are between £500 and £5,000 in our sample.
>
> **Second chart** — the top 20 most popular models. You can see the volume leaders.
>
> **Third chart** — how the fuel type has changed year by year. This one is interesting because you can see when petrol was dominant and where electric starts appearing.
>
> **Fourth chart** — the depreciation curve. This shows how car prices fall as cars get older. You can see it drops sharply in the first few years, then flattens.
>
> **Fifth chart** — price versus mileage. As expected, cars with higher mileage cost less.
>
> **Sixth chart** — price spread by make. Some makes have big price ranges — luxury brands vary a lot.
>
> **Seventh chart** — regional pricing. Prices per UK city.
>
> All these charts are interactive — you can hover over them to see exact values."

---

## 7. Ethics (30 seconds)

> "One last thing — we took the ethical side seriously.
>
> We only scrape **publicly available data** — nothing behind logins. We space our requests out so we don't overwhelm the websites. We identify ourselves in our web requests. And we don't republish the data — it stays on our own system for analysis only.
>
> We followed the academic framework from **Krotov and Silva's 2018 paper** on web scraping ethics, which is in our reference list."

---

## 8. Closing (30 seconds)

> "So that's MotorLens UK.
>
> To recap:
> - We scraped **real data** from three UK car websites using three different tools
> - We built a **cleaning pipeline** with six steps and a clear audit trail
> - We produced **seven interactive charts** for exploring the data
> - The whole thing is a proper web application, not just a Jupyter notebook
>
> Thank you. Happy to take questions."

---

## Q&A — Prepared answers

**Q: Why did you choose these three websites?**
> "We tested several — AutoTrader is the biggest UK car marketplace so we had to include it. Cinch is a growing online-only retailer. Heycar is a dealer aggregator. Together they cover three different segments of the market."

**Q: What's the hardest problem you solved?**
> "The anti-bot systems. When we first tried scraping AutoTrader with basic Python, we got empty pages. We had to research how to bypass these systems and eventually used ScrapingBee. Understanding *why* websites block scrapers and *how* to work around it ethically was probably the biggest learning experience."

**Q: Would this work in real production?**
> "For a real company, yes — but they'd pay for a bigger ScrapingBee plan, use a proper database like PostgreSQL instead of SQLite, and probably run scrapers on a schedule. The architecture we've built would scale up cleanly."

**Q: Why no predictive model?**
> "The assignment brief specifically says predictive modelling is out of scope for Portfolio 2. It would come in Portfolio 3."

**Q: How do you know the data is real?**
> "You can click any listing card and it takes you to the original page on AutoTrader or Cinch. The prices, mileage, and years match what the dealer is actually asking."

**Q: How long did the whole project take?**
> "About [X days] of active development. Most of the time was on the anti-bot problem — that consumed the first few days. Once we had ScrapingBee working, the cleaning and EDA came together quickly."

**Q: What would you improve if you had more time?**
> "Three things. First, more listings — we'd scrape daily to build up a history. Second, a real map view for regional pricing instead of a bar chart. Third, we'd add owner reviews for sentiment analysis, which we couldn't fit in this time."

**Q: Show me the code for a scraper.**
> Open `backend/scrapers/bs4_autotrader.py`. Point at:
> - "This bit calls ScrapingBee to fetch the page"
> - "This bit finds all the listing elements on the page"
> - "This bit pulls out price, mileage, year using pattern matching"

**Q: Where's the code hosted?**
> "GitHub — the link is in the report. All commits are tracked."

---

## Cheat sheet — key numbers to remember

| Thing | Number |
|---|---|
| Total listings | 113 |
| Sources | 3 (AutoTrader, Cinch, Heycar) |
| Tools | 3 (BeautifulSoup, Playwright, requests) |
| Charts | 7 |
| Cleaning steps | 6 |
| Makes | 24 |
| Price range | £485 to £13,195 |

---

## The most important tips

1. **Speak slowly.** Nervous people rush.
2. **Look at the audience, not the screen.**
3. **If something breaks live, don't panic.** Say "Let me refresh" — buys time.
4. **If they ask something you don't know**, say "That's a good question, we didn't explore that in this scope, but our next iteration would look at it." Never make things up.
5. **The teacher wants to see you understand your own project.** They'll ask follow-up questions to check that.
