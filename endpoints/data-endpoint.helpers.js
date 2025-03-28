const {
  generateIncomeOutcomeData,
  generateRandomSimplifiedIncomeOutcomeData,
} = require("../helpers/generators/income-outcome.generator");
const { generateWeatherResponse } = require("../helpers/generators/weather.generator");
const { HTTP_OK } = require("../helpers/response.helpers");
const { logDebug } = require("../helpers/logger-api");
const { generateEcommerceShoppingCart } = require("../helpers/generators/ecommerce-shopping-cart.generator");
const { generateRandomUser } = require("../helpers/generators/user.generator");
const { generateRandomSimpleBusTicketCard } = require("../helpers/generators/bus-ticket.generator");
const { generateRandomStudentsData } = require("../helpers/generators/student-grades-manager.generator");
const { generateRandomEmployeesData } = require("../helpers/generators/employees.generator");
const { generateSystemMetricsResponse } = require("../helpers/generators/system-metrics");

function generateWeatherResponseBasedOnQuery(queryParams, simplified = false, totalRandom = false) {
  const days = parseInt(queryParams.get("days"));
  const future = parseInt(queryParams.get("futuredays"));
  const date = queryParams.get("date");
  const city = queryParams.get("city");
  const limitedDays = Math.min(days || 31, 90);
  let limitedFutureDays = Math.min(future || 0, 90);
  return generateWeatherResponse(date, days, city, limitedDays, limitedFutureDays, simplified, totalRandom);
}

function generateEcommerceShoppingCartResponse(queryParams, simplified = false, totalRandom = false) {
  let ecommerceShoppingCartData = generateEcommerceShoppingCart(totalRandom);

  if (simplified === true) {
    ecommerceShoppingCartData = {
      cartItems: ecommerceShoppingCartData.cartItems,
    };
  }

  return ecommerceShoppingCartData;
}

function handleData(req, res, isAdmin) {
  const urlEnds = req.url.replace(/\/\/+/g, "/");

  if (
    req.method === "GET" &&
    (req.url.includes("/api/v1/data/weather") || req.url.includes("/api/v1/data/weather-simple"))
  ) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);

    const weatherData = generateWeatherResponseBasedOnQuery(
      queryParams,
      req.url.includes("/api/v1/data/weather-simple")
    );

    res.status(HTTP_OK).json(weatherData);
    return;
  }

  if (req.method === "GET" && req.url.includes("/api/v1/data/costs")) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);

    const days = parseInt(queryParams.get("days"));
    const limitedDays = Math.min(days || 31, 90);
    logDebug(`Requested costs data for:`, { days, limitedDays });

    const incomeOutcomeData = generateIncomeOutcomeData(limitedDays);
    res.status(HTTP_OK).json(incomeOutcomeData);
    return;
  }

  if (req.method === "GET" && req.url.includes("/api/v1/data/random/costs")) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);

    const days = parseInt(queryParams.get("days"));
    const limitedDays = Math.min(days || 31, 90);
    logDebug(`Requested costs data for:`, { days, limitedDays });

    const incomeOutcomeData = generateRandomSimplifiedIncomeOutcomeData(limitedDays);
    res.status(HTTP_OK).json(incomeOutcomeData);
    return;
  }

  if (
    req.method === "GET" &&
    (req.url.includes("/api/v1/data/random/weather") || req.url.includes("/api/v1/data/random/weather-simple"))
  ) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    const weatherData = generateWeatherResponseBasedOnQuery(queryParams, req.url.includes("weather-simple"), true);
    res.status(HTTP_OK).json(weatherData);
    return;
  }

  if (
    (req.method === "POST" || req.method === "PUT") &&
    (req.url.includes("/api/v1/data/random/weather") || req.url.includes("/api/v1/data/random/weather-simple"))
  ) {
    const days = parseInt(req.body.days);
    const futuredays = parseInt(req.body.futuredays);

    if (days < 0) {
      res.status(400).json({ error: "Days must be greater than 0" });
      return;
    }

    if (futuredays < 0) {
      res.status(400).json({ error: "Future days must be greater than 0" });
      return;
    }

    if (days === 0 && futuredays === 0) {
      res.status(HTTP_OK).json([]);
      return;
    }

    const city = req.body.city;
    const date = req.body.date;
    const limitedDays = Math.min(days || 31, 90);
    let limitedFutureDays = Math.min(futuredays || 0, 90);

    const weatherData = generateWeatherResponse(
      date,
      days,
      city,
      limitedDays,
      limitedFutureDays,
      req.url.includes("weather-simple"),
      true
    );
    res.status(HTTP_OK).json(weatherData);
    return;
  }

  if (
    req.method === "GET" &&
    (req.url.includes("/api/v1/data/random/ecommerce-shopping-cart") ||
      req.url.includes("/api/v1/data/random/ecommerce-shopping-cart-simple"))
  ) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    const ecommerceShoppingCartData = generateEcommerceShoppingCartResponse(
      queryParams,
      req.url.includes("ecommerce-shopping-cart-simple"),
      true
    );
    res.status(HTTP_OK).json(ecommerceShoppingCartData);
    return;
  }

  if (req.method === "GET" && req.url.includes("/api/v1/data/random/simple-user")) {
    const userData = generateRandomUser();
    res.status(HTTP_OK).json(userData);
    return;
  }

  if (req.method === "GET" && req.url.includes("/api/v1/data/random/simple-bus-ticket-card")) {
    const busTicketCard = generateRandomSimpleBusTicketCard();
    res.status(HTTP_OK).json(busTicketCard);
    return;
  }

  if (req.method === "GET" && req.url.includes("/api/v1/data/random/students")) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    const seed = queryParams.get("seed");

    const studentsData = generateRandomStudentsData({ seed });
    res.status(HTTP_OK).json(studentsData);
    return;
  }

  if (req.method === "GET" && req.url.includes("/api/v1/data/random/system")) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    const seed = queryParams.get("seed");
    const samples = parseInt(queryParams.get("samples")) || 1;
    const interval = parseInt(queryParams.get("interval")) || 1000;
    const simplified = queryParams.get("simplified") === "true";

    const systemData = generateSystemMetricsResponse(samples, interval, simplified);
    res.status(HTTP_OK).json(systemData);
    return;
  }

  if (req.method === "GET" && req.url.includes("/api/v1/data/random/employees")) {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    const seed = queryParams.get("seed") || Math.random().toString();
    const details = queryParams.get("details") === "true";

    const employeesData = generateRandomEmployeesData({ seed, details });
    res.status(HTTP_OK).json(employeesData);
    return;
  }
  return;
}

module.exports = {
  handleData,
};
