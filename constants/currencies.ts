import { Currency } from "@/types";

export const currencies: Currency[] = [
    {
        code: "VND",
        symbol: "₫",
        name: "Vietnamese Dong",
    },
    {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
    },
    {
        code: "EUR",
        symbol: "€",
        name: "Euro",
    },
    {
        code: "GBP",
        symbol: "£",
        name: "British Pound",
    },
    {
        code: "JPY",
        symbol: "¥",
        name: "Japanese Yen",
    },
    {
        code: "CNY",
        symbol: "¥",
        name: "Chinese Yuan",
    },
    {
        code: "KRW",
        symbol: "₩",
        name: "South Korean Won",
    },
    {
        code: "SGD",
        symbol: "S$",
        name: "Singapore Dollar",
    },
];

export const getCurrencyByCode = (code: string): Currency => {
    return (
        currencies.find(
            (currency) => currency.code.toLowerCase() === code.toLowerCase()
        ) || currencies[0]
    );
};

export const formatCurrency = (
    amount: number,
    currencyCode: string = "VND"
): string => {
    const currency = getCurrencyByCode(currencyCode);

    // Format with thousand separators
    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "decimal",
        maximumFractionDigits: 0,
    }).format(amount);

    return `${formattedAmount} ${currency.code}`;
};
