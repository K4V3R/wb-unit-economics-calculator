// Получаем все элементы
const productNameInput = document.getElementById('productName');
const costInput = document.getElementById('cost');
const deliveryInput = document.getElementById('delivery');
const wbCommissionInput = document.getElementById('wbCommission');
const advertisingInput = document.getElementById('advertising');
const buyoutRateInput = document.getElementById('buyoutRate');
const returnRateInput = document.getElementById('returnRate');
const logisticsPerItemInput = document.getElementById('logisticsPerItem');
const acquiringInput = document.getElementById('acquiring');
const additionalCommissionInput = document.getElementById('additionalCommission');
const taxInput = document.getElementById('tax');
const profitMarginInput = document.getElementById('profitMargin');
const saveBtn = document.getElementById('saveBtn');

const totalExpensesEl = document.getElementById('totalExpenses');
const recommendedPriceEl = document.getElementById('recommendedPrice');
const profitEl = document.getElementById('profit');
const marginEl = document.getElementById('margin');
const statusEl = document.getElementById('status');
const breakEvenEl = document.getElementById('breakEvenPrice');

let selectedMargin = 20;
let profitMode = 'auto';
const productsListEl = document.getElementById('productsList');

// Массив для сохраненных товаров
let savedProducts = JSON.parse(localStorage.getItem('wbProducts')) || [];

// График
let profitChart = null;

// Инициализация графика
function initChart() {
    const ctx = document.getElementById('profitChart').getContext('2d');
    profitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Прибыль (₽)',
                data: [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return 'Прибыль: ' + context.parsed.y.toFixed(2) + ' ₽';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Цена (₽)',
                        color: '#9ca3af'
                    },
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Прибыль (₽)',
                        color: '#9ca3af'
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) {
                            return value.toFixed(0) + ' ₽';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Обновление графика
function updateChart() {
    if (!profitChart) return;
    
    const cost = parseFloat(costInput.value) || 0;
    const delivery = parseFloat(deliveryInput.value) || 0;
    const wbCommission = parseFloat(wbCommissionInput.value) || 0;
    const advertising = parseFloat(advertisingInput.value) || 0;
    const buyoutRate = parseFloat(buyoutRateInput.value) || 0;
    const returnRate = parseFloat(returnRateInput.value) || 0;
    const logisticsPerItem = parseFloat(logisticsPerItemInput.value) || 0;
    const acquiring = parseFloat(acquiringInput.value) || 0;
    const additionalCommission = parseFloat(additionalCommissionInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;
    
    // Расчет с учетом процента выкупа и возвратов
    const effectiveBuyoutRate = buyoutRate / 100;
    const effectiveReturnRate = returnRate / 100;
    const actualSoldRate = effectiveBuyoutRate * (1 - effectiveReturnRate);
    
    const baseExpenses = cost + delivery;
    const logisticsCost = logisticsPerItem;
    
    // Генерируем данные для графика
    const prices = [];
    const profits = [];
    
    // Диапазон цен: от 50% до 200% от базовых расходов с учетом выкупа
    const minPrice = (baseExpenses / actualSoldRate + logisticsCost) * 0.5;
    const maxPrice = (baseExpenses / actualSoldRate + logisticsCost) * 2;
    const step = (maxPrice - minPrice) / 20;
    
    for (let price = minPrice; price <= maxPrice; price += step) {
        prices.push(price.toFixed(0));
        
        // Расчет прибыли для каждой цены с учетом всех комиссий
        const wbCommissionAmount = price * (wbCommission / 100);
        const advertisingAmount = price * (advertising / 100);
        const acquiringAmount = price * (acquiring / 100);
        const additionalCommissionAmount = price * (additionalCommission / 100);
        const taxAmount = price * (tax / 100);
        const totalExpensesPerSold = (baseExpenses / actualSoldRate + logisticsCost) + wbCommissionAmount + advertisingAmount + acquiringAmount + additionalCommissionAmount + taxAmount;
        const profit = price - totalExpensesPerSold;
        
        profits.push(profit);
    }
    
    // Добавляем точку безубыточности
    const wbCommissionAmount = wbCommission / 100;
    const advertisingAmount = advertising / 100;
    const acquiringAmount = acquiring / 100;
    const additionalCommissionAmount = additionalCommission / 100;
    const taxAmount = tax / 100;
    const totalPercentageDeductions = wbCommissionAmount + advertisingAmount + acquiringAmount + additionalCommissionAmount + taxAmount;
    const expensesPerSoldItem = baseExpenses / actualSoldRate + logisticsCost;
    const breakEvenPrice = totalPercentageDeductions < 1 ? expensesPerSoldItem / (1 - totalPercentageDeductions) : expensesPerSoldItem * 2;
    
    profitChart.data.labels = prices;
    profitChart.data.datasets[0].data = profits;
    
    // Добавляем вертикальную линию для точки безубыточности
    profitChart.options.plugins.annotation = {
        annotations: {
            line1: {
                type: 'line',
                xMin: breakEvenPrice.toFixed(0),
                xMax: breakEvenPrice.toFixed(0),
                borderColor: '#ef4444',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    content: 'Безубыточность',
                    enabled: true,
                    position: 'start',
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    color: '#ffffff'
                }
            }
        }
    };
    
    profitChart.update();
}

// Основная функция расчета
function calculate() {
    // Получаем входные данные
    const productName = productNameInput.value.trim();
    const cost = parseFloat(costInput.value) || 0;
    const delivery = parseFloat(deliveryInput.value) || 0;
    const wbCommission = parseFloat(wbCommissionInput.value) || 0;
    const advertising = parseFloat(advertisingInput.value) || 0;
    const buyoutRate = parseFloat(buyoutRateInput.value) || 0;
    const returnRate = parseFloat(returnRateInput.value) || 0;
    const logisticsPerItem = parseFloat(logisticsPerItemInput.value) || 0;
    const acquiring = parseFloat(acquiringInput.value) || 0;
    const additionalCommission = parseFloat(additionalCommissionInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;
    const profitMargin = parseFloat(profitMarginInput.value) || 0;
    
    // Расчет с учетом процента выкупа и возвратов
    const effectiveBuyoutRate = buyoutRate / 100;
    const effectiveReturnRate = returnRate / 100;
    const actualSoldRate = effectiveBuyoutRate * (1 - effectiveReturnRate);
    
    // Базовые расходы на единицу товара
    const baseExpenses = cost + delivery;
    
    // Логистика WB за единицу (учитывается только для проданных товаров)
    const logisticsCost = logisticsPerItem;
    
    // Расчет рекомендуемой цены
    // Формула учитывает, что расходы на логистику и комиссии относятся только к проданным товарам
    const wbCommissionAmount = wbCommission / 100;
    const advertisingAmount = advertising / 100;
    const acquiringAmount = acquiring / 100;
    const additionalCommissionAmount = additionalCommission / 100;
    const taxAmount = tax / 100;
    
    // Общие процентные вычеты от цены
    const totalPercentageDeductions = wbCommissionAmount + advertisingAmount + acquiringAmount + additionalCommissionAmount + taxAmount;
    
    // Расходы на единицу проданного товара
    const expensesPerSoldItem = baseExpenses / actualSoldRate + logisticsCost;
    
    // Расчет точки безубыточности
    let breakEvenPrice;
    if (totalPercentageDeductions >= 1) {
        breakEvenPrice = expensesPerSoldItem * 2;
    } else {
        breakEvenPrice = expensesPerSoldItem / (1 - totalPercentageDeductions);
    }
    breakEvenPrice = breakEvenPrice.toFixed(0);
    
    // Желаемая прибыль
    let profitMultiplier;
    if (profitMode === 'manual') {
        profitMultiplier = 1 + (profitMargin / 100);
    } else {
        profitMultiplier = 1 + (selectedMargin / 100);
    }
    
    let recommendedPrice;
    if (totalPercentageDeductions >= 1) {
        recommendedPrice = expensesPerSoldItem * profitMultiplier * 10; // Защита от деления на ноль
    } else {
        recommendedPrice = (expensesPerSoldItem * profitMultiplier) / (1 - totalPercentageDeductions);
    }
    
    // Расчет всех комиссий и налогов от цены
    const wbCommissionTotal = recommendedPrice * wbCommissionAmount;
    const advertisingTotal = recommendedPrice * advertisingAmount;
    const acquiringTotal = recommendedPrice * acquiringAmount;
    const additionalCommissionTotal = recommendedPrice * additionalCommissionAmount;
    const taxTotal = recommendedPrice * taxAmount;
    
    // Итоговые расходы на проданный товар
    const totalExpensesPerSold = expensesPerSoldItem + wbCommissionTotal + advertisingTotal + acquiringTotal + additionalCommissionTotal + taxTotal;
    
    // Расчет оптимальной цены для целевой маржи
    const targetMargin = selectedMargin; // целевая маржа %
    
    let optimalPrice;
    if (targetMargin >= 100) {
        optimalPrice = totalExpensesPerSold;
    } else {
        optimalPrice = totalExpensesPerSold / (1 - (targetMargin / 100));
    }
    
    optimalPrice = optimalPrice.toFixed(0);
    
    // Прибыль с проданного товара
    const profit = recommendedPrice - totalExpensesPerSold;
    
    // Маржа в процентах
    const margin = recommendedPrice > 0 ? (profit / recommendedPrice) * 100 : 0;
    
    // Текст рекомендации по марже
    let recommendation = '';
    
    if (margin < 10) {
        recommendation = 'Подними цену — слишком низкая маржа';
    } else if (margin < 15) {
        recommendation = 'Можно немного увеличить цену';
    } else if (margin <= 25) {
        recommendation = 'Оптимальная цена 👍';
    } else if (margin <= 35) {
        recommendation = 'Цена высокая, проверь спрос';
    } else {
        recommendation = 'Слишком высокая цена — могут не покупать';
    }
    
    console.log('Recommendation:', recommendation);
    
    // Обновляем рекомендацию по цене
    const recEl = document.getElementById('priceRecommendation');
    recEl.textContent = recommendation;
    
    // Цвет в зависимости от маржи
    recEl.classList.remove('good', 'warning', 'bad');
    
    if (margin >= 15 && margin <= 25) {
        recEl.classList.add('good');
    } else if (margin < 15) {
        recEl.classList.add('bad');
    } else {
        recEl.classList.add('warning');
    }
    
    // Обновляем оптимальную цену
    const optimalPriceEl = document.getElementById('optimalPrice');
    optimalPriceEl.textContent = optimalPrice;
    
    // Обновляем точку безубыточности
    breakEvenEl.textContent = breakEvenPrice + ' ₽';
    
    // Обновляем детализацию расходов
    document.getElementById('wbFee').textContent = wbCommissionTotal.toFixed(0) + ' ₽';
    document.getElementById('adsCost').textContent = advertisingTotal.toFixed(0) + ' ₽';
    document.getElementById('taxCost').textContent = taxTotal.toFixed(0) + ' ₽';
    document.getElementById('logisticsCost').textContent = logisticsCost.toFixed(0) + ' ₽';
    
    // Обновляем отображение с анимацией
    updateResult(recommendedPriceEl, recommendedPrice.toFixed(2));
    updateResult(totalExpensesEl, totalExpensesPerSold.toFixed(2));
    
    // Обновляем прибыль с цветом
    updateProfit(profitEl, profit.toFixed(2));
    
    // Обновляем маржу с цветом
    updateMargin(marginEl, margin.toFixed(2));
    
    // Обновляем статус
    updateStatus(profit, margin);
    
    // Обновляем визуальные подсказки
    updateVisualHints(margin, buyoutRate, wbCommission);
    
    // Обновляем график
    updateChart();
}

// Функция сохранения расчета
function saveCalculation() {
    const productName = productNameInput.value.trim();
    
    if (!productName) {
        alert('Пожалуйста, введите название товара');
        return;
    }
    
    const cost = parseFloat(costInput.value) || 0;
    const delivery = parseFloat(deliveryInput.value) || 0;
    const wbCommission = parseFloat(wbCommissionInput.value) || 0;
    const advertising = parseFloat(advertisingInput.value) || 0;
    const buyoutRate = parseFloat(buyoutRateInput.value) || 0;
    const returnRate = parseFloat(returnRateInput.value) || 0;
    const logisticsPerItem = parseFloat(logisticsPerItemInput.value) || 0;
    const acquiring = parseFloat(acquiringInput.value) || 0;
    const additionalCommission = parseFloat(additionalCommissionInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;
    const profitMargin = parseFloat(profitMarginInput.value) || 0;
    
    // Расчет с учетом процента выкупа и возвратов
    const effectiveBuyoutRate = buyoutRate / 100;
    const effectiveReturnRate = returnRate / 100;
    const actualSoldRate = effectiveBuyoutRate * (1 - effectiveReturnRate);
    
    const baseExpenses = cost + delivery;
    const logisticsCost = logisticsPerItem;
    
    const wbCommissionAmount = wbCommission / 100;
    const advertisingAmount = advertising / 100;
    const acquiringAmount = acquiring / 100;
    const additionalCommissionAmount = additionalCommission / 100;
    const taxAmount = tax / 100;
    const totalPercentageDeductions = wbCommissionAmount + advertisingAmount + acquiringAmount + additionalCommissionAmount + taxAmount;
    
    const expensesPerSoldItem = baseExpenses / actualSoldRate + logisticsCost;
    const profitMultiplier = 1 + (profitMargin / 100);
    
    let recommendedPrice;
    if (totalPercentageDeductions >= 1) {
        recommendedPrice = expensesPerSoldItem * profitMultiplier * 10;
    } else {
        recommendedPrice = (expensesPerSoldItem * profitMultiplier) / (1 - totalPercentageDeductions);
    }
    
    const wbCommissionTotal = recommendedPrice * wbCommissionAmount;
    const advertisingTotal = recommendedPrice * advertisingAmount;
    const acquiringTotal = recommendedPrice * acquiringAmount;
    const additionalCommissionTotal = recommendedPrice * additionalCommissionAmount;
    const taxTotal = recommendedPrice * taxAmount;
    const totalExpensesPerSold = expensesPerSoldItem + wbCommissionTotal + advertisingTotal + acquiringTotal + additionalCommissionTotal + taxTotal;
    const profit = recommendedPrice - totalExpensesPerSold;
    
    // Создаем объект товара
    const product = {
        id: Date.now(),
        name: productName,
        price: recommendedPrice.toFixed(2),
        profit: profit.toFixed(2),
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    // Добавляем в массив
    savedProducts.push(product);
    
    // Сохраняем в localStorage
    localStorage.setItem('wbProducts', JSON.stringify(savedProducts));
    
    // Обновляем отображение
    renderProducts();
    
    // Очищаем поле названия
    productNameInput.value = '';
    
    // Показываем уведомление
    showNotification('Расчет сохранен!');
}

// Функция отображения сохраненных товаров
function renderProducts() {
    if (savedProducts.length === 0) {
        productsListEl.innerHTML = `
            <div class="empty-state">
                <p>Нет сохраненных товаров</p>
                <p>Сохраните расчет, чтобы увидеть его здесь</p>
            </div>
        `;
        return;
    }
    
    productsListEl.innerHTML = savedProducts.map(product => `
        <div class="product-card">
            <div class="product-header">
                <h3 class="product-name">${product.name}</h3>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Удалить</button>
            </div>
            <div class="product-metrics">
                <div class="metric-item">
                    <div class="metric-label">Цена</div>
                    <div class="metric-value">${product.price} ₽</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Прибыль</div>
                    <div class="metric-value profit ${parseFloat(product.profit) < 0 ? 'negative' : ''}">${product.profit} ₽</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Сохранено</div>
                    <div class="metric-value">${product.timestamp}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Функция удаления товара
function deleteProduct(id) {
    if (confirm('Удалить этот товар?')) {
        savedProducts = savedProducts.filter(product => product.id !== id);
        localStorage.setItem('wbProducts', JSON.stringify(savedProducts));
        renderProducts();
        showNotification('Товар удален');
    }
}

// Функция показа уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Функция обновления результата с плавной анимацией
function updateResult(element, value) {
    const oldValue = parseFloat(element.textContent) || 0;
    const newValue = parseFloat(value) || 0;
    
    // Если значения одинаковы, не анимируем
    if (Math.abs(oldValue - newValue) < 0.01) {
        element.textContent = value;
        return;
    }
    
    // Добавляем класс для анимации
    element.classList.add('updated');
    
    // Плавная анимация изменения значения
    const duration = 300; // длительность анимации в ms
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Используем easeOutCubic для плавности
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = oldValue + (newValue - oldValue) * easeProgress;
        element.textContent = currentValue.toFixed(2);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = value;
            element.classList.remove('updated');
        }
    }
    
    requestAnimationFrame(animate);
}

// Функция обновления прибыли с цветом и плавной анимацией
function updateProfit(element, value) {
    const oldValue = parseFloat(element.textContent) || 0;
    const newValue = parseFloat(value) || 0;
    
    // Удаляем все классы цвета
    element.classList.remove('positive', 'neutral', 'negative');
    
    // Добавляем соответствующий класс
    if (newValue > 0) {
        element.classList.add('positive');
    } else if (newValue < -1) {
        element.classList.add('negative');
    } else {
        element.classList.add('neutral');
    }
    
    // Если значения одинаковы, не анимируем
    if (Math.abs(oldValue - newValue) < 0.01) {
        element.textContent = value;
        return;
    }
    
    // Добавляем класс для анимации
    element.classList.add('updated');
    
    // Плавная анимация изменения значения
    const duration = 300;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Используем easeOutCubic для плавности
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = oldValue + (newValue - oldValue) * easeProgress;
        element.textContent = currentValue.toFixed(2);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = value;
            element.classList.remove('updated');
        }
    }
    
    requestAnimationFrame(animate);
}

// Функция обновления маржи с цветом и плавной анимацией
function updateMargin(element, value) {
    const oldValue = parseFloat(element.textContent) || 0;
    const newValue = parseFloat(value) || 0;
    
    // Удаляем все классы цвета
    element.classList.remove('positive', 'neutral', 'negative');
    
    // Добавляем соответствующий класс
    if (newValue > 5) {
        element.classList.add('positive');
    } else if (newValue < 0) {
        element.classList.add('negative');
    } else {
        element.classList.add('neutral');
    }
    
    // Если значения одинаковы, не анимируем
    if (Math.abs(oldValue - newValue) < 0.01) {
        element.textContent = value;
        return;
    }
    
    // Добавляем класс для анимации
    element.classList.add('updated');
    
    // Плавная анимация изменения значения
    const duration = 300;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Используем easeOutCubic для плавности
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = oldValue + (newValue - oldValue) * easeProgress;
        element.textContent = currentValue.toFixed(2);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = value;
            element.classList.remove('updated');
        }
    }
    
    requestAnimationFrame(animate);
}

// Функция обновления статуса
function updateStatus(profit, margin) {
    statusEl.classList.remove('profitable', 'risky', 'unprofitable');
    
    if (profit > 0 && margin > 5) {
        statusEl.textContent = 'Выгодно';
        statusEl.classList.add('profitable');
    } else if (profit >= -10 && margin >= 0) {
        statusEl.textContent = 'Риск';
        statusEl.classList.add('risky');
    } else {
        statusEl.textContent = 'Убыточно';
        statusEl.classList.add('unprofitable');
    }
}

// Функция визуальных подсказок
function updateVisualHints(margin, buyoutRate, wbCommission) {
    // Сбросить все цвета
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.style.borderColor = '';
    });
    
    // Подсветка проблемных значений (красный)
    if (margin < 5) {
        document.getElementById('advertising').style.borderColor = '#dc2626';
    }
    
    if (buyoutRate < 50) {
        document.getElementById('buyoutRate').style.borderColor = '#dc2626';
    }
    
    if (wbCommission > 20) {
        document.getElementById('wbCommission').style.borderColor = '#dc2626';
    }
    
    // Подсветка хороших значений (зеленый)
    if (margin > 15) {
        document.getElementById('advertising').style.borderColor = '#16a34a';
    }
    
    if (buyoutRate > 80) {
        document.getElementById('buyoutRate').style.borderColor = '#16a34a';
    }
    
    if (wbCommission < 10) {
        document.getElementById('wbCommission').style.borderColor = '#16a34a';
    }
}

// Добавляем обработчики событий на все инпуты с debounce для оптимизации
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Уменьшаем debounce до 150ms для более быстрого отклика
const debouncedCalculate = debounce(calculate, 150);

// Автоматический расчет при вводе
productNameInput.addEventListener('input', debouncedCalculate);
costInput.addEventListener('input', debouncedCalculate);
deliveryInput.addEventListener('input', debouncedCalculate);
wbCommissionInput.addEventListener('input', debouncedCalculate);
advertisingInput.addEventListener('input', debouncedCalculate);
buyoutRateInput.addEventListener('input', debouncedCalculate);
returnRateInput.addEventListener('input', debouncedCalculate);
logisticsPerItemInput.addEventListener('input', debouncedCalculate);
acquiringInput.addEventListener('input', debouncedCalculate);
additionalCommissionInput.addEventListener('input', debouncedCalculate);
taxInput.addEventListener('input', debouncedCalculate);
profitMarginInput.addEventListener('input', debouncedCalculate);

// Мгновенный расчет при изменении значения (для input type="number")
const numberInputs = [costInput, deliveryInput, wbCommissionInput, advertisingInput, 
                      buyoutRateInput, returnRateInput, logisticsPerItemInput, 
                      acquiringInput, additionalCommissionInput, taxInput, profitMarginInput];

numberInputs.forEach(input => {
    // Событие change срабатывает при потере фокуса или изменении значения
    input.addEventListener('change', calculate);
    
    // Дополнительное событие для отслеживания изменений через стрелки
    input.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
            calculate();
        }
    });
});

// Для текстового поля тоже добавляем change событие
productNameInput.addEventListener('change', calculate);

// Обработчик кнопки сохранения
saveBtn.addEventListener('click', saveCalculation);

// Initial calculation on page load
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    calculate();
    renderProducts();
    
    // Set initial manual margin visibility
    const manualBlock = document.querySelector('.manual-margin');
    if (profitMode === 'manual') {
        manualBlock.classList.add('active');
    }
});

// Tooltip functionality
const tooltip = document.querySelector('.tooltip');
const tooltipBox = document.getElementById('tooltip-box');

if (tooltip && tooltipBox) {
    tooltip.addEventListener('mouseenter', () => {
        tooltipBox.style.display = 'block';
        tooltipBox.textContent = 'Комиссия Wildberries — процент, который маркетплейс берет с продажи товара. Обычно 10–25%.';
    });

    tooltip.addEventListener('mousemove', (e) => {
        tooltipBox.style.top = e.pageY + 10 + 'px';
        tooltipBox.style.left = e.pageX + 10 + 'px';
    });

    tooltip.addEventListener('mouseleave', () => {
        tooltipBox.style.display = 'none';
    });
}

// Margin button handlers
document.querySelectorAll('.margin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.margin-btn')
            .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        selectedMargin = parseInt(btn.dataset.margin);

        calculate();
    });
});

// Profit mode radio button handlers
document.querySelectorAll('input[name="profitMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        profitMode = e.target.value;

        const manualBlock = document.querySelector('.manual-margin');

        if (profitMode === 'manual') {
            manualBlock.classList.add('active');
        } else {
            manualBlock.classList.remove('active');
        }

        calculate();
    });
});
