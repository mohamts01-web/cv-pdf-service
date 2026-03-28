import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 1️⃣ ضع محتوى HTML
    await page.setContent(html, { waitUntil: "networkidle0" });

    // 2️⃣ انتظر تحميل كل الخطوط (مهم للعربية والإنجليزية)
    await page.evaluateHandle('document.fonts.ready');

    // 3️⃣ توليد PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
    });

    await browser.close();

    // 4️⃣ إرسال PDF للمستخدم
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=cv.pdf"
    });

    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
