export class InvalidCryptoExchangeError extends Error {
    code;
    constructor(message = 'Invalid crypto exchange') {
        super(message);
        this.code = InvalidCryptoExchangeError.code;
    }
    static code = 'ERR_INVALID_CRYPTO_EXCHANGE';
}
//# sourceMappingURL=errors.js.map