// Test simulasi logika hutang dan titip uang
console.log("=== TEST SIMULASI LOGIKA HUTANG ===\n");

// Scenario yang dijelaskan user:
// 1. Customer berhutang 500ribu
// 2. Customer bayar 600ribu (overpay 100ribu jadi titip uang)
// 3. Customer berhutang lagi 120ribu
// 4. Hasil: customer harusnya hutang 20ribu ke toko

console.log("Skenario 1: Customer hutang awal");
let customerDebt = 500000;
let customerTitipUang = 0;
console.log(`Hutang customer: Rp ${customerDebt.toLocaleString()}`);
console.log(`Titip uang customer: Rp ${customerTitipUang.toLocaleString()}`);
console.log(`Net balance: Rp ${(customerDebt - customerTitipUang).toLocaleString()} (customer hutang)\n`);

console.log("Skenario 2: Customer bayar 600ribu");
let payment = 600000;
let overpayment = payment - customerDebt;
customerDebt = 0; // Hutang lunas
customerTitipUang = overpayment; // Kelebihan jadi titip uang
console.log(`Payment: Rp ${payment.toLocaleString()}`);
console.log(`Hutang customer setelah bayar: Rp ${customerDebt.toLocaleString()}`);
console.log(`Titip uang customer: Rp ${customerTitipUang.toLocaleString()}`);
console.log(`Net balance: Rp ${(customerDebt - customerTitipUang).toLocaleString()} (customer titip uang)\n`);

console.log("Skenario 3: Customer hutang lagi 120ribu");
let newDebt = 120000;
let autoPayment = Math.min(newDebt, customerTitipUang);
newDebt = newDebt - autoPayment;
customerTitipUang = customerTitipUang - autoPayment;
customerDebt = newDebt;

console.log(`Hutang baru: Rp ${(newDebt + autoPayment).toLocaleString()}`);
console.log(`Auto payment dari titip uang: Rp ${autoPayment.toLocaleString()}`);
console.log(`Sisa hutang customer: Rp ${customerDebt.toLocaleString()}`);
console.log(`Sisa titip uang customer: Rp ${customerTitipUang.toLocaleString()}`);
console.log(`Net balance: Rp ${(customerDebt - customerTitipUang).toLocaleString()} (customer ${customerDebt > customerTitipUang ? 'hutang' : customerTitipUang > customerDebt ? 'titip uang' : 'lunas'})\n`);

console.log("=== HASIL YANG DIHARAPKAN ===");
console.log("Customer seharusnya hutang 20ribu ke toko");
console.log(`Hasil perhitungan: Customer ${customerDebt > 0 ? `hutang ${customerDebt.toLocaleString()}` : customerTitipUang > 0 ? `titip uang ${customerTitipUang.toLocaleString()}` : 'lunas'}`);

if (customerDebt === 20000 && customerTitipUang === 0) {
    console.log("✅ LOGIKA BENAR!");
} else {
    console.log("❌ LOGIKA SALAH!");
}
