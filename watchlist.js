let walletBalance = parseFloat(localStorage.getItem("walletBalance")) || 100000;

function loadWatchlist() {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    let stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    const watchlistContainer = document.getElementById("watchlistContainer");
    watchlistContainer.innerHTML = "";

    watchlist.forEach(stockName => {
        let stock = stocks.find(s => s.name === stockName);
        if (!stock) return;

        let existingElement = document.getElementById(`stock-${stock.name}`);
        let selectedQuantity = existingElement ? document.getElementById(`quantity-${stock.name}`).value : 1;

        let stockItem = document.createElement("div");
        stockItem.classList.add("stock-item");
        stockItem.id = `stock-${stock.name}`;
        stockItem.innerHTML = `
            <h3>${stock.name}</h3>
            <p>Price: ₹<span class="stock-price">${stock.price.toFixed(2)}</span></p>
            <input type="number" id="quantity-${stock.name}" min="1" value="${selectedQuantity}">
            <button class="buy-btn" onclick="buyStock('${stock.name}')">Buy</button>
            <button class="sell-btn" onclick="sellStock('${stock.name}')">Sell</button>
            <button class="remove-btn" onclick="removeFromWatchlist('${stock.name}')">Remove</button>
        `;

        watchlistContainer.appendChild(stockItem);
    });
}

function updateStockPrices() {
    let stocks = JSON.parse(localStorage.getItem("stocks")) || [];

    stocks.forEach((stock, index) => {
        let price = stock.price;
        let change = 0;

        if (price >= 100 && price < 500) {
            change = (Math.random() * (2 - 1) + 1).toFixed(2);
        } else if (price >= 500 && price < 1000) {
            change = (Math.random() * (10 - 5) + 5).toFixed(2);
        } else if (price >= 1000 && price < 2000) {
            change = (Math.random() * (20 - 10) + 10).toFixed(2);
        } else if (price >= 2000) {
            change = (Math.random() * (50 - 20) + 20).toFixed(2);
        }

        let direction = Math.random() < 0.5 ? -1 : 1;
        stocks[index].price += direction * parseFloat(change);
    });

    localStorage.setItem("stocks", JSON.stringify(stocks));
    document.querySelectorAll(".stock-item").forEach(item => {
        let stockName = item.id.replace("stock-", "");
        let stock = stocks.find(s => s.name === stockName);
        if (stock) {
            item.querySelector(".stock-price").textContent = stock.price.toFixed(2);
        }
    });
}

function buyStock(name) {
    let stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    let stock = stocks.find(s => s.name === name);
    if (!stock) return;

    let quantity = parseInt(document.getElementById(`quantity-${name}`).value);
    if (isNaN(quantity) || quantity <= 0) return;

    let totalCost = stock.price * quantity;
    if (walletBalance < totalCost) {
        alert("Insufficient balance!");
        return;
    }

    walletBalance -= totalCost;
    localStorage.setItem("walletBalance", walletBalance);

    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
    let existingStock = portfolio.find(s => s.name === name);

    if (existingStock) {
        existingStock.quantity += quantity;
    } else {
        portfolio.push({ name, buyPrice: stock.price, quantity });
    }

    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    alert(`${quantity} shares of ${name} bought successfully!`);
}

function sellStock(name) {
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
    let stock = portfolio.find(s => s.name === name);

    if (!stock) {
        alert("You do not own this stock!");
        return;
    }

    let quantity = parseInt(document.getElementById(`quantity-${name}`).value);
    if (isNaN(quantity) || quantity <= 0 || quantity > stock.quantity) return;

    let stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    let marketStock = stocks.find(s => s.name === name);
    if (!marketStock) return;

    let totalSell = marketStock.price * quantity;
    walletBalance += totalSell;
    localStorage.setItem("walletBalance", walletBalance);

    stock.quantity -= quantity;
    if (stock.quantity === 0) {
        portfolio = portfolio.filter(s => s.name !== name);
    }

    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    alert(`${quantity} shares of ${name} sold successfully!`);
}

function removeFromWatchlist(name) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter(stock => stock !== name);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    loadWatchlist();
}

document.getElementById("searchWatchlist").addEventListener("input", () => {
    let query = document.getElementById("searchWatchlist").value.toLowerCase();
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    let stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    let filteredStocks = watchlist.filter(stockName => stockName.toLowerCase().includes(query));

    const watchlistContainer = document.getElementById("watchlistContainer");
    watchlistContainer.innerHTML = "";
    filteredStocks.forEach(stockName => {
        let stock = stocks.find(s => s.name === stockName);
        if (!stock) return;

        let existingElement = document.getElementById(`stock-${stock.name}`);
        let selectedQuantity = existingElement ? document.getElementById(`quantity-${stock.name}`).value : 1;

        let stockItem = document.createElement("div");
        stockItem.classList.add("stock-item");
        stockItem.id = `stock-${stock.name}`;
        stockItem.innerHTML = `
            <h3>${stock.name}</h3>
            <p>Price: ₹<span class="stock-price">${stock.price.toFixed(2)}</span></p>
            <input type="number" id="quantity-${stock.name}" min="1" value="${selectedQuantity}">
            <button class="buy-btn" onclick="buyStock('${stock.name}')">Buy</button>
            <button class="sell-btn" onclick="sellStock('${stock.name}')">Sell</button>
            <button class="remove-btn" onclick="removeFromWatchlist('${stock.name}')">Remove</button>
        `;

        watchlistContainer.appendChild(stockItem);
    });
});

setInterval(updateStockPrices, 1000);
loadWatchlist();
