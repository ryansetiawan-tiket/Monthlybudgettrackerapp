import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3adbeaf1/health", (c) => {
  return c.json({ status: "ok" });
});

// Get budget for specific month
app.get("/make-server-3adbeaf1/budget/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const key = `budget:${year}-${month}`;
    
    const budget = await kv.get(key);
    
    if (!budget) {
      return c.json({
        initialBudget: 0,
        carryover: 0,
        additionalIncome: 0,
        notes: "",
        incomeDeduction: 0,
      });
    }
    
    return c.json(budget);
  } catch (error) {
    console.log(`Error getting budget: ${error}`);
    return c.json({ error: `Failed to get budget: ${error.message}` }, 500);
  }
});

// Save/update budget for specific month
app.post("/make-server-3adbeaf1/budget/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const key = `budget:${year}-${month}`;
    
    const body = await c.req.json();
    const { initialBudget, carryover, notes, incomeDeduction } = body;
    
    const budgetData = {
      initialBudget: Number(initialBudget) || 0,
      carryover: Number(carryover) || 0,
      notes: notes || "",
      incomeDeduction: Number(incomeDeduction) || 0,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, budgetData);
    
    return c.json({ success: true, data: budgetData });
  } catch (error) {
    console.log(`Error saving budget: ${error}`);
    return c.json({ error: `Failed to save budget: ${error.message}` }, 500);
  }
});

// Get all expenses for specific month
app.get("/make-server-3adbeaf1/expenses/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const prefix = `expense:${year}-${month}:`;
    
    const expenses = await kv.getByPrefix(prefix);
    
    return c.json(expenses || []);
  } catch (error) {
    console.log(`Error getting expenses: ${error}`);
    return c.json({ error: `Failed to get expenses: ${error.message}` }, 500);
  }
});

// Add new expense
app.post("/make-server-3adbeaf1/expenses/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const body = await c.req.json();
    
    const { name, amount, date, items, color, fromIncome, currency, originalAmount, exchangeRate, conversionType, deduction } = body;
    
    console.log('POST expense - Received body:', body);
    
    if (!name || amount === undefined) {
      return c.json({ error: "Name and amount are required" }, 400);
    }
    
    const expenseId = crypto.randomUUID();
    const key = `expense:${year}-${month}:${expenseId}`;
    
    const expenseData = {
      id: expenseId,
      name,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      ...(items && items.length > 0 ? { items } : {}),
      ...(color ? { color } : {}),
      ...(fromIncome ? { fromIncome: true } : {}),
      ...(currency ? { currency } : {}),
      ...(originalAmount !== undefined ? { originalAmount: Number(originalAmount) } : {}),
      ...(exchangeRate !== undefined ? { exchangeRate: Number(exchangeRate) } : {}),
      ...(conversionType ? { conversionType } : {}),
      ...(deduction !== undefined ? { deduction: Number(deduction) } : {}),
      createdAt: new Date().toISOString(),
    };
    
    console.log('POST expense - Saving to DB:', expenseData);
    
    await kv.set(key, expenseData);
    
    return c.json({ success: true, data: expenseData });
  } catch (error) {
    console.log(`Error adding expense: ${error}`);
    return c.json({ error: `Failed to add expense: ${error.message}` }, 500);
  }
});

// Delete expense
app.delete("/make-server-3adbeaf1/expenses/:year/:month/:id", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const id = c.req.param("id");
    const key = `expense:${year}-${month}:${id}`;
    
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting expense: ${error}`);
    return c.json({ error: `Failed to delete expense: ${error.message}` }, 500);
  }
});

// Update expense
app.put("/make-server-3adbeaf1/expenses/:year/:month/:id", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const id = c.req.param("id");
    const key = `expense:${year}-${month}:${id}`;
    const body = await c.req.json();
    
    const { name, amount, date, items, color, fromIncome, currency, originalAmount, exchangeRate, conversionType, deduction } = body;
    
    if (!name || amount === undefined) {
      return c.json({ error: "Name and amount are required" }, 400);
    }
    
    const expenseData = {
      id,
      name,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      ...(items && items.length > 0 ? { items } : {}),
      ...(color ? { color } : {}),
      ...(fromIncome ? { fromIncome: true } : {}),
      ...(currency ? { currency } : {}),
      ...(originalAmount !== undefined ? { originalAmount: Number(originalAmount) } : {}),
      ...(exchangeRate !== undefined ? { exchangeRate: Number(exchangeRate) } : {}),
      ...(conversionType ? { conversionType } : {}),
      ...(deduction !== undefined ? { deduction: Number(deduction) } : {}),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, expenseData);
    
    return c.json({ success: true, data: expenseData });
  } catch (error) {
    console.log(`Error updating expense: ${error}`);
    return c.json({ error: `Failed to update expense: ${error.message}` }, 500);
  }
});

// Get all additional incomes for specific month
app.get("/make-server-3adbeaf1/additional-income/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const prefix = `income:${year}-${month}:`;
    
    const incomes = await kv.getByPrefix(prefix);
    
    return c.json(incomes || []);
  } catch (error) {
    console.log(`Error getting additional incomes: ${error}`);
    return c.json({ error: `Failed to get additional incomes: ${error.message}` }, 500);
  }
});

// Add new additional income
app.post("/make-server-3adbeaf1/additional-income/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const body = await c.req.json();
    
    const { name, amount, currency, exchangeRate, amountIDR, conversionType, date, deduction } = body;
    
    console.log('POST income - Received body:', body);
    
    if (!name || amount === undefined) {
      return c.json({ error: "Name and amount are required" }, 400);
    }
    
    const incomeId = crypto.randomUUID();
    const key = `income:${year}-${month}:${incomeId}`;
    
    const incomeData = {
      id: incomeId,
      name,
      amount: Number(amount),
      currency: currency || "IDR",
      exchangeRate: exchangeRate ? Number(exchangeRate) : null,
      amountIDR: Number(amountIDR),
      conversionType: conversionType || "manual",
      date: date || new Date().toISOString().split('T')[0],
      deduction: Number(deduction) || 0,
      createdAt: new Date().toISOString(),
    };
    
    console.log('POST income - Saving to DB:', incomeData);
    
    await kv.set(key, incomeData);
    
    // Store income name for autocomplete suggestions
    const nameKey = `income-name:${name.toLowerCase()}`;
    await kv.set(nameKey, { name, lastUsed: new Date().toISOString() });
    
    return c.json({ success: true, data: incomeData });
  } catch (error) {
    console.log(`Error adding additional income: ${error}`);
    return c.json({ error: `Failed to add additional income: ${error.message}` }, 500);
  }
});

// Delete additional income
app.delete("/make-server-3adbeaf1/additional-income/:year/:month/:id", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const id = c.req.param("id");
    const key = `income:${year}-${month}:${id}`;
    
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting additional income: ${error}`);
    return c.json({ error: `Failed to delete additional income: ${error.message}` }, 500);
  }
});

// Update additional income
app.put("/make-server-3adbeaf1/additional-income/:year/:month/:id", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const id = c.req.param("id");
    const key = `income:${year}-${month}:${id}`;
    const body = await c.req.json();
    
    const { name, amount, currency, exchangeRate, amountIDR, conversionType, date, deduction } = body;
    
    if (!name || amount === undefined) {
      return c.json({ error: "Name and amount are required" }, 400);
    }
    
    // Get existing data to preserve createdAt
    const existingIncome = await kv.get(key);
    
    const incomeData = {
      id,
      name,
      amount: Number(amount),
      currency: currency || "IDR",
      exchangeRate: exchangeRate ? Number(exchangeRate) : null,
      amountIDR: Number(amountIDR),
      conversionType: conversionType || "manual",
      date: date || new Date().toISOString().split('T')[0],
      deduction: Number(deduction) || 0,
      createdAt: existingIncome?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, incomeData);
    
    // Update income name for autocomplete suggestions
    const nameKey = `income-name:${name.toLowerCase()}`;
    await kv.set(nameKey, { name, lastUsed: new Date().toISOString() });
    
    return c.json({ success: true, data: incomeData });
  } catch (error) {
    console.log(`Error updating additional income: ${error}`);
    return c.json({ error: `Failed to update additional income: ${error.message}` }, 500);
  }
});

// Get income name suggestions
app.get("/make-server-3adbeaf1/income-names", async (c) => {
  try {
    const prefix = "income-name:";
    const names = await kv.getByPrefix(prefix);
    
    // Sort by last used
    const sortedNames = (names || [])
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .map(item => item.name);
    
    return c.json(sortedNames);
  } catch (error) {
    console.log(`Error getting income names: ${error}`);
    return c.json({ error: `Failed to get income names: ${error.message}` }, 500);
  }
});

// Get exchange rate from USD to IDR
app.get("/make-server-3adbeaf1/exchange-rate", async (c) => {
  try {
    const apiKey = Deno.env.get("EXCHANGE_RATE_API_KEY");
    
    if (!apiKey) {
      return c.json({ error: "Exchange rate API key not configured" }, 500);
    }
    
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/IDR`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate from API");
    }
    
    const data = await response.json();
    
    if (data.result !== "success") {
      throw new Error("Exchange rate API returned error");
    }
    
    return c.json({ 
      rate: data.conversion_rate,
      lastUpdated: data.time_last_update_utc 
    });
  } catch (error) {
    console.log(`Error getting exchange rate: ${error}`);
    return c.json({ error: `Failed to get exchange rate: ${error.message}` }, 500);
  }
});

// Get all fixed expense templates
app.get("/make-server-3adbeaf1/templates", async (c) => {
  try {
    const prefix = "template:";
    const templates = await kv.getByPrefix(prefix);
    
    return c.json(templates || []);
  } catch (error) {
    console.log(`Error getting templates: ${error}`);
    return c.json({ error: `Failed to get templates: ${error.message}` }, 500);
  }
});

// Add new fixed expense template
app.post("/make-server-3adbeaf1/templates", async (c) => {
  try {
    const body = await c.req.json();
    const { name, items, color } = body;
    
    if (!name || !items || !Array.isArray(items)) {
      return c.json({ error: "Name and items are required" }, 400);
    }
    
    const templateId = crypto.randomUUID();
    const key = `template:${templateId}`;
    
    const templateData = {
      id: templateId,
      name,
      items,
      ...(color ? { color } : {}),
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(key, templateData);
    
    return c.json({ success: true, data: templateData });
  } catch (error) {
    console.log(`Error adding template: ${error}`);
    return c.json({ error: `Failed to add template: ${error.message}` }, 500);
  }
});

// Update fixed expense template
app.put("/make-server-3adbeaf1/templates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const key = `template:${id}`;
    const body = await c.req.json();
    
    const { name, items, color } = body;
    
    if (!name || !items || !Array.isArray(items)) {
      return c.json({ error: "Name and items are required" }, 400);
    }
    
    const templateData = {
      id,
      name,
      items,
      ...(color ? { color } : {}),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, templateData);
    
    return c.json({ success: true, data: templateData });
  } catch (error) {
    console.log(`Error updating template: ${error}`);
    return c.json({ error: `Failed to update template: ${error.message}` }, 500);
  }
});

// Delete fixed expense template
app.delete("/make-server-3adbeaf1/templates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const key = `template:${id}`;
    
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting template: ${error}`);
    return c.json({ error: `Failed to delete template: ${error.message}` }, 500);
  }
});

// Get exclude state lock for specific month
app.get("/make-server-3adbeaf1/exclude-state/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const key = `exclude-state:${year}-${month}`;
    
    const excludeState = await kv.get(key);
    
    if (!excludeState) {
      return c.json({
        locked: false,
        excludedExpenseIds: [],
        excludedIncomeIds: [],
        isDeductionExcluded: false,
      });
    }
    
    return c.json(excludeState);
  } catch (error) {
    console.log(`Error getting exclude state: ${error}`);
    return c.json({ error: `Failed to get exclude state: ${error.message}` }, 500);
  }
});

// Save/update exclude state lock for specific month
app.post("/make-server-3adbeaf1/exclude-state/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const key = `exclude-state:${year}-${month}`;
    
    const body = await c.req.json();
    const { locked, excludedExpenseIds, excludedIncomeIds, isDeductionExcluded } = body;
    
    const excludeStateData = {
      locked: Boolean(locked),
      excludedExpenseIds: excludedExpenseIds || [],
      excludedIncomeIds: excludedIncomeIds || [],
      isDeductionExcluded: Boolean(isDeductionExcluded),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, excludeStateData);
    
    return c.json({ success: true, data: excludeStateData });
  } catch (error) {
    console.log(`Error saving exclude state: ${error}`);
    return c.json({ error: `Failed to save exclude state: ${error.message}` }, 500);
  }
});

// Delete exclude state lock for specific month
app.delete("/make-server-3adbeaf1/exclude-state/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    const key = `exclude-state:${year}-${month}`;
    
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting exclude state: ${error}`);
    return c.json({ error: `Failed to delete exclude state: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);