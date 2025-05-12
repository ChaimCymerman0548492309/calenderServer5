import puppeteer from "puppeteer-core";

export async function fillFormDemoQA() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // ודא שהנתיב נכון אצלך
    slowMo: 100,
  });

  const page = await browser.newPage();
  await page.goto("https://demoqa.com/text-box");

  // מילוי שדות
  await page.type("#userName", "חיים צימרמן");
  await page.type("#userEmail", "lkkasdl@gmail.com");
  await page.type("#currentAddress", "טבריה");
  await page.type("#permanentAddress", "הי אני בוט אוטומציה  ......     ");

  // שליחה
  await page.click("#submit");

  // המתן 5 שניות לצפייה בתוצאה
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await browser.close();
}
