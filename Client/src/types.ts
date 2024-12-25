export type Transaction = {
    transaction_id: string;
    merchant_name: string;
    name: string;
    amount: number;
    personal_finance_category: {
        primary: string;
    }
    category: string;
    date: string;
    date_time: string;
    iso_currency_code: string;
    unofficial_currency_code: string;
    logo_url: string;
    personal_finance_category_icon_url: string;
}