import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ie207_erp');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Helper function to get random number in range
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random item from array
const randomItem = (arr) => arr[random(0, arr.length - 1)];

// Generate stock based on distribution requirement
// 10% = 0 (out of stock), 20% < 10 (low stock), 70% >= 50 (in stock)
const generateStock = (index) => {
    if (index < 10) return 0; // First 10 products: out of stock
    if (index < 30) return random(1, 9); // Next 20 products: low stock (1-9)
    return random(50, 500); // Remaining 70: normal stock
};

// Generate realistic products data
const generateProducts = () => {
    const products = [];

    // Category definitions with realistic product names and specs
    const categories = {
        'vi-dieu-khien': {
            label: 'Vi điều khiển',
            products: [
                { name: 'Arduino Uno R3', code: 'ARD-UNO-R3', specs: { Voltage: '5V', Flash: '32KB', Clock: '16MHz', GPIO: '14 pins' } },
                { name: 'Arduino Nano', code: 'ARD-NANO', specs: { Voltage: '5V', Flash: '32KB', Clock: '16MHz', GPIO: '22 pins' } },
                { name: 'Arduino Mega 2560', code: 'ARD-MEGA', specs: { Voltage: '5V', Flash: '256KB', Clock: '16MHz', GPIO: '54 pins' } },
                { name: 'ESP32 DevKit V1', code: 'ESP32-DEV', specs: { Voltage: '3.3V', Flash: '4MB', Clock: '240MHz', WiFi: '802.11 b/g/n', Bluetooth: '4.2' } },
                { name: 'ESP8266 NodeMCU', code: 'ESP8266-MCU', specs: { Voltage: '3.3V', Flash: '4MB', Clock: '80MHz', WiFi: '802.11 b/g/n' } },
                { name: 'STM32F103C8T6', code: 'STM32-C8T6', specs: { Voltage: '3.3V', Flash: '64KB', Clock: '72MHz', GPIO: '37 pins' } },
                { name: 'Raspberry Pi Pico', code: 'RPI-PICO', specs: { Voltage: '3.3V', Flash: '2MB', Clock: '133MHz', GPIO: '26 pins' } },
                { name: 'ATmega328P DIP-28', code: 'ATMEGA328P', specs: { Voltage: '5V', Flash: '32KB', Clock: '20MHz', GPIO: '23 pins' } },
                { name: 'ATtiny85 DIP-8', code: 'ATTINY85', specs: { Voltage: '5V', Flash: '8KB', Clock: '20MHz', GPIO: '6 pins' } },
                { name: 'PIC16F877A', code: 'PIC16F877A', specs: { Voltage: '5V', Flash: '14KB', Clock: '20MHz', GPIO: '33 pins' } },
                { name: 'STM32F407VGT6', code: 'STM32-F407', specs: { Voltage: '3.3V', Flash: '1MB', Clock: '168MHz', GPIO: '80 pins' } },
                { name: 'MSP430G2553', code: 'MSP430-G2553', specs: { Voltage: '3.3V', Flash: '16KB', Clock: '16MHz', GPIO: '24 pins' } },
                { name: 'CH340G USB-TTL', code: 'CH340G', specs: { Interface: 'USB to UART', BaudRate: '9600-115200', Voltage: '3.3V-5V' } },
                { name: 'CP2102 USB-TTL', code: 'CP2102', specs: { Interface: 'USB to UART', BaudRate: '300-1M', Voltage: '3.3V-5V' } },
                { name: 'Arduino Pro Mini 5V', code: 'ARD-PROMINI-5V', specs: { Voltage: '5V', Flash: '32KB', Clock: '16MHz', GPIO: '14 pins' } },
                { name: 'Wemos D1 Mini', code: 'WEMOS-D1', specs: { Voltage: '3.3V', Flash: '4MB', Clock: '80MHz', WiFi: '802.11 b/g/n' } },
            ]
        },
        'cam-bien': {
            label: 'Cảm biến',
            products: [
                { name: 'DHT11 Nhiệt độ Độ ẩm', code: 'DHT11', specs: { TempRange: '0-50°C', HumidityRange: '20-90%', Accuracy: '±2°C, ±5%', Voltage: '3-5V' } },
                { name: 'DHT22 Nhiệt độ Độ ẩm', code: 'DHT22', specs: { TempRange: '-40-80°C', HumidityRange: '0-100%', Accuracy: '±0.5°C, ±2%', Voltage: '3-5V' } },
                { name: 'DS18B20 Nhiệt độ chống nước', code: 'DS18B20', specs: { TempRange: '-55-125°C', Accuracy: '±0.5°C', Interface: '1-Wire', Voltage: '3-5V' } },
                { name: 'BMP180 Áp suất khí quyển', code: 'BMP180', specs: { Range: '300-1100hPa', Accuracy: '±1hPa', Interface: 'I2C', Voltage: '3.3V' } },
                { name: 'BMP280 Áp suất nhiệt độ', code: 'BMP280', specs: { Range: '300-1100hPa', TempRange: '-40-85°C', Interface: 'I2C/SPI', Voltage: '3.3V' } },
                { name: 'HC-SR04 Siêu âm', code: 'HCSR04', specs: { Range: '2-400cm', Accuracy: '3mm', Voltage: '5V', Frequency: '40kHz' } },
                { name: 'HC-SR501 Hồng ngoại PIR', code: 'HCSR501', specs: { Range: '7m', Angle: '120°', Delay: '5-200s', Voltage: '5-20V' } },
                { name: 'MQ-2 Khí gas', code: 'MQ2', specs: { Gas: 'LPG, Smoke, Alcohol', Range: '300-10000ppm', Voltage: '5V', Heater: '5V' } },
                { name: 'MQ-135 Chất lượng không khí', code: 'MQ135', specs: { Gas: 'NH3, NOx, CO2', Range: '10-1000ppm', Voltage: '5V', Heater: '5V' } },
                { name: 'LM35 Nhiệt độ Analog', code: 'LM35', specs: { TempRange: '-55-150°C', Accuracy: '±0.5°C', Output: '10mV/°C', Voltage: '4-30V' } },
                { name: 'Cảm biến mưa', code: 'RAIN-SENSOR', specs: { Type: 'Analog/Digital', Voltage: '3.3-5V', Sensitivity: 'Adjustable' } },
                { name: 'Cảm biến độ ẩm đất', code: 'SOIL-SENSOR', specs: { Type: 'Capacitive', Range: '0-100%', Voltage: '3.3-5V', Output: 'Analog' } },
                { name: 'TCRT5000 Hồng ngoại phản xạ', code: 'TCRT5000', specs: { Distance: '2.5mm', Wavelength: '950nm', Voltage: '3-5V', Output: 'Digital' } },
                { name: 'GY-521 MPU6050 Gia tốc Gyro', code: 'MPU6050', specs: { Gyro: '±250-2000°/s', Accel: '±2-16g', Interface: 'I2C', Voltage: '3-5V' } },
                { name: 'BH1750 Cường độ ánh sáng', code: 'BH1750', specs: { Range: '1-65535lx', Accuracy: '±20%', Interface: 'I2C', Voltage: '3-5V' } },
                { name: 'MAX30102 Nhịp tim Oxy máu', code: 'MAX30102', specs: { LED: 'Red+IR', Range: '0-100%SpO2', Interface: 'I2C', Voltage: '3.3V' } },
            ]
        },
        'dien-tro': {
            label: 'Linh kiện điện tử - Điện trở',
            category: 'linh-kien-dien-tu', // Map to valid enum
            products: [
                { name: 'Điện trở 220Ω 1/4W', code: 'RES-220-025W', specs: { Resistance: '220Ω', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Điện trở 1kΩ 1/4W', code: 'RES-1K-025W', specs: { Resistance: '1kΩ', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Điện trở 10kΩ 1/4W', code: 'RES-10K-025W', specs: { Resistance: '10kΩ', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Điện trở 100kΩ 1/4W', code: 'RES-100K-025W', specs: { Resistance: '100kΩ', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Điện trở 330Ω 1/2W', code: 'RES-330-05W', specs: { Resistance: '330Ω', Power: '1/2W', Tolerance: '±5%', Type: 'Metal Film' } },
                { name: 'Điện trở 4.7kΩ 1/4W', code: 'RES-4K7-025W', specs: { Resistance: '4.7kΩ', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Điện trở 100Ω 1W', code: 'RES-100-1W', specs: { Resistance: '100Ω', Power: '1W', Tolerance: '±5%', Type: 'Metal Oxide' } },
                { name: 'Điện trở 2.2kΩ 1/4W', code: 'RES-2K2-025W', specs: { Resistance: '2.2kΩ', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Điện trở 47kΩ 1/4W', code: 'RES-47K-025W', specs: { Resistance: '47kΩ', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Điện trở 1MΩ 1/4W', code: 'RES-1M-025W', specs: { Resistance: '1MΩ', Power: '1/4W', Tolerance: '±5%', Type: 'Carbon Film' } },
                { name: 'Biến trở 10kΩ', code: 'POT-10K', specs: { Resistance: '10kΩ', Type: 'Rotary', Taper: 'Linear', Power: '0.25W' } },
                { name: 'Biến trở 100kΩ', code: 'POT-100K', specs: { Resistance: '100kΩ', Type: 'Rotary', Taper: 'Linear', Power: '0.25W' } },
                { name: 'Trở quang LDR 5mm', code: 'LDR-5MM', specs: { LightRes: '10kΩ', DarkRes: '1MΩ', Wavelength: '540nm', Power: '100mW' } },
                { name: 'Nhiệt trở NTC 10kΩ', code: 'NTC-10K', specs: { Resistance: '10kΩ @25°C', Beta: '3950K', Range: '-40-125°C', Tolerance: '±1%' } },
            ]
        },
        'tu-dien': {
            label: 'Linh kiện điện tử - Tụ điện',
            category: 'linh-kien-dien-tu', // Map to valid enum
            products: [
                { name: 'Tụ ceramic 100nF 50V', code: 'CAP-104-50V', specs: { Capacitance: '100nF', Voltage: '50V', Type: 'Ceramic', Tolerance: '±10%' } },
                { name: 'Tụ ceramic 22pF 50V', code: 'CAP-22P-50V', specs: { Capacitance: '22pF', Voltage: '50V', Type: 'Ceramic', Tolerance: '±5%' } },
                { name: 'Tụ hóa 100μF 25V', code: 'CAP-100UF-25V', specs: { Capacitance: '100μF', Voltage: '25V', Type: 'Electrolytic', Tolerance: '±20%' } },
                { name: 'Tụ hóa 1000μF 16V', code: 'CAP-1000UF-16V', specs: { Capacitance: '1000μF', Voltage: '16V', Type: 'Electrolytic', Tolerance: '±20%' } },
                { name: 'Tụ hóa 220μF 35V', code: 'CAP-220UF-35V', specs: { Capacitance: '220μF', Voltage: '35V', Type: 'Electrolytic', Tolerance: '±20%' } },
                { name: 'Tụ hóa 10μF 50V', code: 'CAP-10UF-50V', specs: { Capacitance: '10μF', Voltage: '50V', Type: 'Electrolytic', Tolerance: '±20%' } },
                { name: 'Tụ hóa 470μF 25V', code: 'CAP-470UF-25V', specs: { Capacitance: '470μF', Voltage: '25V', Type: 'Electrolytic', Tolerance: '±20%' } },
                { name: 'Tụ ceramic 10nF 50V', code: 'CAP-103-50V', specs: { Capacitance: '10nF', Voltage: '50V', Type: 'Ceramic', Tolerance: '±10%' } },
                { name: 'Tụ tantalum 47μF 16V', code: 'CAP-47UF-16V-TA', specs: { Capacitance: '47μF', Voltage: '16V', Type: 'Tantalum', Tolerance: '±10%' } },
                { name: 'Tụ polyester 1μF 100V', code: 'CAP-1UF-100V', specs: { Capacitance: '1μF', Voltage: '100V', Type: 'Polyester', Tolerance: '±5%' } },
                { name: 'Tụ hóa 2200μF 16V', code: 'CAP-2200UF-16V', specs: { Capacitance: '2200μF', Voltage: '16V', Type: 'Electrolytic', Tolerance: '±20%' } },
                { name: 'Tụ ceramic 1nF 50V', code: 'CAP-102-50V', specs: { Capacitance: '1nF', Voltage: '50V', Type: 'Ceramic', Tolerance: '±10%' } },
            ]
        },
        'linh-kien-dien-tu': {
            category: 'module-truyen-thong', // Map to valid enum
            label: 'Module',
            products: [
                { name: 'Module Relay 1 kênh 5V', code: 'RELAY-1CH-5V', specs: { Channels: '1', Voltage: '5V', Load: '10A 250VAC', Trigger: 'Active Low' } },
                { name: 'Module Relay 2 kênh 5V', code: 'RELAY-2CH-5V', specs: { Channels: '2', Voltage: '5V', Load: '10A 250VAC', Trigger: 'Active Low' } },
                { name: 'Module Relay 4 kênh 5V', code: 'RELAY-4CH-5V', specs: { Channels: '4', Voltage: '5V', Load: '10A 250VAC', Trigger: 'Active Low' } },
                { name: 'Module Relay 8 kênh 5V', code: 'RELAY-8CH-5V', specs: { Channels: '8', Voltage: '5V', Load: '10A 250VAC', Trigger: 'Active Low' } },
                { name: 'Module nguồn MB102 3.3V/5V', code: 'MB102-PSU', specs: { OutputVoltage: '3.3V/5V', MaxCurrent: '700mA', Input: '6-12V DC/USB' } },
                { name: 'Module step-down LM2596', code: 'LM2596-BUCK', specs: { InputVoltage: '4-35V', OutputVoltage: '1.25-30V', MaxCurrent: '3A', Efficiency: '92%' } },
                { name: 'Module step-up MT3608', code: 'MT3608-BOOST', specs: { InputVoltage: '2-24V', OutputVoltage: '5-28V', MaxCurrent: '2A', Efficiency: '93%' } },
                { name: 'Module sạc pin TP4056', code: 'TP4056-CHARGER', specs: { ChargeCurrent: '1A', InputVoltage: '5V', BatteryType: 'Li-ion/Li-Po', Protection: 'Over-charge/discharge' } },
                { name: 'Module cầu H L298N', code: 'L298N-HBRIDGE', specs: { Channels: '2', MaxCurrent: '2A/channel', Voltage: '5-35V', PWM: 'Supported' } },
                { name: 'Module cầu H DRV8825', code: 'DRV8825-DRIVER', specs: { MaxCurrent: '2.2A', Voltage: '8.2-45V', StepMode: '1/32', Protection: 'Thermal/OCP' } },
                { name: 'Module RFID RC522', code: 'RC522-RFID', specs: { Frequency: '13.56MHz', Distance: '5cm', Interface: 'SPI', Voltage: '3.3V' } },
                { name: 'Module RTC DS3231', code: 'DS3231-RTC', specs: { Accuracy: '±2ppm', Battery: 'CR2032', Interface: 'I2C', Voltage: '3.3-5V' } },
                { name: 'Module SD Card', code: 'SD-MODULE', specs: { Interface: 'SPI', Voltage: '3.3-5V', Support: 'SD/SDHC/MMC', MaxSize: '32GB' } },
                { name: 'Module Bluetooth HC-05', code: 'HC05-BT', specs: { Version: 'Bluetooth 2.0', Range: '10m', BaudRate: '9600', Voltage: '3.6-6V' } },
                { name: 'Module Bluetooth HC-06', code: 'HC06-BT', specs: { Version: 'Bluetooth 2.0', Mode: 'Slave only', BaudRate: '9600', Voltage: '3.6-6V' } },
                { name: 'Module WiFi ESP-01', code: 'ESP01-WIFI', specs: { WiFi: '802.11 b/g/n', GPIO: '2 pins', Flash: '512KB', Voltage: '3.3V' } },
                { name: 'Module LCD I2C 1602', code: 'LCD-1602-I2C', specs: { Display: '16x2 chars', Backlight: 'Blue', Interface: 'I2C', Voltage: '5V' } },
                { name: 'Module LCD I2C 2004', code: 'LCD-2004-I2C', specs: { Display: '20x4 chars', Backlight: 'Blue', Interface: 'I2C', Voltage: '5V' } },
                { name: 'Module OLED 0.96" I2C', code: 'OLED-096-I2C', specs: { Size: '0.96 inch', Resolution: '128x64', Color: 'White/Blue', Interface: 'I2C', Voltage: '3-5V' } },
                { name: 'Module OLED 1.3" SPI', code: 'OLED-13-SPI', specs: { Size: '1.3 inch', Resolution: '128x64', Color: 'White/Blue', Interface: 'SPI', Voltage: '3-5V' } },
                { name: 'Module TFT 2.4" ILI9341', code: 'TFT-24-ILI9341', specs: { Size: '2.4 inch', Resolution: '240x320', Touch: 'Resistive', Interface: 'SPI', Voltage: '3.3-5V' } },
                { name: 'Module SIM900A GSM', code: 'SIM900A-GSM', specs: { Network: '2G GSM', Frequency: '850/900/1800/1900MHz', Interface: 'UART', Voltage: '5V' } },
                { name: 'Module A6 GSM/GPRS', code: 'A6-GSM', specs: { Network: '2G GSM/GPRS', SMS: 'Supported', Call: 'Supported', Voltage: '5V' } },
            ]
        },
        'dong-co': {
            label: 'LED & Động cơ',
            category: 'dong-co', // Keep as is - valid enum
            products: [
                { name: 'LED đỏ 5mm', code: 'LED-RED-5MM', specs: { Color: 'Red', Size: '5mm', Voltage: '1.8-2.2V', Current: '20mA', Brightness: '1000-2000mcd' } },
                { name: 'LED xanh lá 5mm', code: 'LED-GREEN-5MM', specs: { Color: 'Green', Size: '5mm', Voltage: '3-3.4V', Current: '20mA', Brightness: '2000-4000mcd' } },
                { name: 'LED xanh dương 5mm', code: 'LED-BLUE-5MM', specs: { Color: 'Blue', Size: '5mm', Voltage: '3-3.4V', Current: '20mA', Brightness: '1500-3000mcd' } },
                { name: 'LED vàng 5mm', code: 'LED-YELLOW-5MM', specs: { Color: 'Yellow', Size: '5mm', Voltage: '2-2.4V', Current: '20mA', Brightness: '1000-2000mcd' } },
                { name: 'LED trắng 5mm', code: 'LED-WHITE-5MM', specs: { Color: 'White', Size: '5mm', Voltage: '3-3.4V', Current: '20mA', Brightness: '6000-8000mcd' } },
                { name: 'LED RGB 5mm chung Catot', code: 'LED-RGB-5MM-CC', specs: { Type: 'RGB Common Cathode', Size: '5mm', Voltage: 'R:2V G:3V B:3V', Current: '20mA/channel' } },
                { name: 'LED RGB 5mm chung Anot', code: 'LED-RGB-5MM-CA', specs: { Type: 'RGB Common Anode', Size: '5mm', Voltage: 'R:2V G:3V B:3V', Current: '20mA/channel' } },
                { name: 'LED 7 đoạn 0.56" đỏ', code: 'LED-7SEG-056-RED', specs: { Type: '7-Segment', Size: '0.56 inch', Color: 'Red', Digits: '1', CommonPin: 'Cathode' } },
                { name: 'LED ma trận 8x8 đỏ', code: 'LED-MATRIX-8X8', specs: { Type: 'Dot Matrix', Size: '8x8', Color: 'Red', Interface: 'SPI MAX7219', Voltage: '5V' } },
                { name: 'Đèn LED dây WS2812B 1m', code: 'WS2812B-1M', specs: { Type: 'Addressable RGB', LEDs: '60 LEDs/m', Voltage: '5V', Control: 'Digital', Waterproof: 'IP30' } },
                { name: 'Đèn LED dây WS2812B 5m', code: 'WS2812B-5M', specs: { Type: 'Addressable RGB', LEDs: '300 LEDs', Voltage: '5V', Control: 'Digital', Waterproof: 'IP65' } },
                { name: 'Module LED 8x8 MAX7219', code: 'MAX7219-8X8', specs: { Type: 'Dot Matrix', Size: '8x8', Color: 'Red', Interface: 'SPI', ChainSupport: 'Yes' } },
            ]
        }
    };

    // Distribute 100 products evenly across categories
    // Total: 100 products
    const productsPerCategory = {
        'vi-dieu-khien': 17,
        'cam-bien': 17,
        'dien-tro': 16,
        'tu-dien': 13,
        'linh-kien-dien-tu': 25,
        'dong-co': 12
    };

    let productIndex = 0;
    const suppliers = [
        'Arduino Official',
        'Espressif',
        'STMicroelectronics',
        'Atmel',
        'Texas Instruments',
        'Generic China',
        'Raspberry Pi Foundation',
        'Adafruit',
        'SparkFun',
        'Seeed Studio',
        'DFRobot',
        'Waveshare'
    ];

    // Generate products for each category
    Object.entries(productsPerCategory).forEach(([categoryKey, count]) => {
        const categoryData = categories[categoryKey];
        const availableProducts = categoryData.products;

        for (let i = 0; i < count; i++) {
            // Cycle through available products, repeat if necessary
            const productTemplate = availableProducts[i % availableProducts.length];

            // Add suffix if we're repeating products
            const suffix = i >= availableProducts.length ? ` (Lô ${Math.floor(i / availableProducts.length) + 1})` : '';

            const product = {
                productCode: i >= availableProducts.length
                    ? `${productTemplate.code}-${Math.floor(i / availableProducts.length) + 1}`
                    : productTemplate.code,
                name: productTemplate.name + suffix,
                description: `${productTemplate.name} chính hãng, chất lượng cao, phù hợp cho các dự án điện tử và IoT${suffix}`,
                category: categoryData.category || categoryKey, // Use mapped category if exists
                price: random(5000, 1000000),
                stock: generateStock(productIndex),
                supplier: randomItem(suppliers),
                specifications: productTemplate.specs,
                imageUrl: `https://placehold.co/400x400/3b82f6/ffffff?text=${encodeURIComponent(productTemplate.name.substring(0, 20))}`,
                isActive: true
            };

            products.push(product);
            productIndex++;
        }
    });

    return products;
};

// Main seeding function
const seedProducts = async () => {
    try {
        console.log('🌱 Starting product seeding...\n');

        // Connect to database
        await connectDB();

        // Clear existing products
        const deleteResult = await Product.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products\n`);

        // Generate and insert products
        const products = generateProducts();

        console.log(`📦 Inserting ${products.length} products...\n`);

        const insertedProducts = await Product.insertMany(products);

        console.log(`✅ Successfully created ${insertedProducts.length} products!\n`);

        // Statistics
        const stats = {
            outOfStock: insertedProducts.filter(p => p.stock === 0).length,
            lowStock: insertedProducts.filter(p => p.stock > 0 && p.stock < 10).length,
            inStock: insertedProducts.filter(p => p.stock >= 50).length
        };

        console.log('📊 Stock Distribution:');
        console.log(`   - Hết hàng (stock = 0): ${stats.outOfStock} sản phẩm (${stats.outOfStock}%)`);
        console.log(`   - Sắp hết (stock < 10): ${stats.lowStock} sản phẩm (${stats.lowStock}%)`);
        console.log(`   - Còn hàng (stock >= 50): ${stats.inStock} sản phẩm (${stats.inStock}%)\n`);

        console.log('📋 Categories:');
        const categoryCounts = {};
        insertedProducts.forEach(p => {
            categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        });
        Object.entries(categoryCounts).forEach(([cat, count]) => {
            console.log(`   - ${cat}: ${count} sản phẩm`);
        });

        console.log('\n🎉 Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};

// Run the seeder
seedProducts();
