/**
 * Web3 Pool Wallet - Frontend Demo
 */

const Web3Wallet = {
    // Connect wallet (demo)
    connect: async function() {
        YatraSecure.showLoading();
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        YatraSecure.hideLoading();
        
        // Generate demo wallet address
        const walletAddress = this.generateWalletAddress();
        
        YatraSecure.showNotification('Wallet connected successfully!', 'success');
        
        return walletAddress;
    },
    
    // Generate demo wallet address
    generateWalletAddress: function() {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    },
    
    // Add expense to pool
    addExpense: async function(tripId, expenseData) {
        try {
            YatraSecure.showLoading();
            
            const response = await fetch(`/trip/${tripId}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(expenseData)
            });
            
            YatraSecure.hideLoading();
            
            if (response.ok) {
                YatraSecure.showNotification('Expense added successfully!', 'success');
                location.reload();
            } else {
                throw new Error('Failed to add expense');
            }
            
        } catch (error) {
            YatraSecure.hideLoading();
            YatraSecure.showNotification('Error adding expense', 'danger');
            console.error(error);
        }
    },
    
    // Calculate split
    calculateSplit: function(amount, members) {
        const perPerson = (amount / members.length).toFixed(2);
        const splits = {};
        
        members.forEach(member => {
            splits[member] = parseFloat(perPerson);
        });
        
        return splits;
    },
    
    // Display wallet info
    displayWalletInfo: function(containerId, walletData) {
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        container.innerHTML = `
            <div class="wallet-card">
                <div class="wallet-header">
                    <h5>Pool Wallet</h5>
                    <span class="badge badge-premium">Web3 Enabled</span>
                </div>
                
                <div class="wallet-address">
                    <small>Wallet Address:</small>
                    <code>${walletData.address}</code>
                    <button class="btn-copy" onclick="Web3Wallet.copyAddress('${walletData.address}')">
                        📋 Copy
                    </button>
                </div>
                
                <div class="wallet-balance">
                    <div class="balance-item">
                        <span>Total Paid</span>
                        <strong>${YatraSecure.formatCurrency(walletData.paid)}</strong>
                    </div>
                    <div class="balance-item">
                        <span>Total Owed</span>
                        <strong>${YatraSecure.formatCurrency(walletData.owed)}</strong>
                    </div>
                    <div class="balance-item ${walletData.balance >= 0 ? 'positive' : 'negative'}">
                        <span>Your Balance</span>
                        <strong>${YatraSecure.formatCurrency(Math.abs(walletData.balance))}</strong>
                        <small>${walletData.balance >= 0 ? 'You are owed' : 'You owe'}</small>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Copy wallet address
    copyAddress: function(address) {
        navigator.clipboard.writeText(address).then(() => {
            YatraSecure.showNotification('Address copied!', 'info');
        });
    },
    
    // Display expense list
    displayExpenses: function(containerId, expenses) {
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        let html = '<div class="expense-list">';
        
        expenses.forEach(expense => {
            html += `
                <div class="expense-item">
                    <div class="expense-icon ${expense.category}">
                        ${this.getCategoryIcon(expense.category)}
                    </div>
                    <div class="expense-details">
                        <h6>${expense.description}</h6>
                        <small>${expense.category} • ${YatraSecure.formatDate(expense.date)}</small>
                    </div>
                    <div class="expense-amount">
                        ${YatraSecure.formatCurrency(expense.amount)}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    // Get category icon
    getCategoryIcon: function(category) {
        const icons = {
            'food': '🍽️',
            'transport': '🚗',
            'accommodation': '🏨',
            'activities': '🎭',
            'misc': '📦'
        };
        return icons[category] || '💰';
    }
};

// Wallet styles
const walletStyles = `
<style>
.wallet-card {
    background: linear-gradient(135deg, #1E3A8A, #2563EB);
    color: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(30, 58, 138, 0.3);
    margin-bottom: 24px;
}

.wallet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.wallet-header h5 {
    margin: 0;
    color: white;
}

.wallet-address {
    background: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.wallet-address code {
    display: block;
    font-family: monospace;
    font-size: 14px;
    word-break: break-all;
    margin: 8px 0;
}

.btn-copy {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.wallet-balance {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.balance-item {
    text-align: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.balance-item span {
    display: block;
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
}

.balance-item strong {
    display: block;
    font-size: 24px;
    margin-bottom: 4px;
}

.balance-item small {
    font-size: 12px;
    opacity: 0.8;
}

.balance-item.positive strong {
    color: #10B981;
}

.balance-item.negative strong {
    color: #EF4444;
}

.expense-list {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.expense-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.expense-item:last-child {
    border-bottom: none;
}

.expense-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: #f3f4f6;
}

.expense-details {
    flex: 1;
}

.expense-details h6 {
    margin: 0 0 4px 0;
    color: #1f2937;
}

.expense-details small {
    color: #6b7280;
}

.expense-amount {
    font-size: 18px;
    font-weight: 600;
    color: #1E3A8A;
}

@media (max-width: 768px) {
    .wallet-balance {
        grid-template-columns: 1fr;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', walletStyles);

// Export
window.Web3Wallet = Web3Wallet;
