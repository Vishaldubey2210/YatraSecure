"""
Web3 Pool Wallet simulation service (Frontend demo)
"""

from datetime import datetime
from app import db
from models.user import Expense, ExpenseSplit
from utils.helpers import calculate_expense_split

class Web3WalletService:
    def __init__(self):
        """Initialize Web3 wallet service"""
        pass
    
    def create_pool_wallet(self, trip_id, admin_user_id):
        """
        Create a pool wallet for a trip (simulation)
        
        Args:
            trip_id (int): Trip ID
            admin_user_id (int): Admin user ID
        
        Returns:
            dict: Wallet info
        """
        # This is a simulation - in real implementation, 
        # you would create actual blockchain wallet
        
        wallet_address = f"0x{trip_id:04d}{admin_user_id:04d}{'0' * 32}"
        
        return {
            'wallet_address': wallet_address,
            'balance': 0.0,
            'trip_id': trip_id,
            'admin_user_id': admin_user_id,
            'created_at': datetime.utcnow()
        }
    
    def add_expense(self, trip_id, paid_by_user_id, amount, category, description, member_ids, split_type='equal'):
        """
        Add expense and calculate splits
        
        Args:
            trip_id (int): Trip ID
            paid_by_user_id (int): User who paid
            amount (float): Total amount
            category (str): Expense category
            description (str): Description
            member_ids (list): List of member user IDs
            split_type (str): Split type
        
        Returns:
            Expense: Created expense object
        """
        # Create expense
        expense = Expense(
            trip_id=trip_id,
            paid_by_user_id=paid_by_user_id,
            amount=amount,
            category=category,
            description=description,
            expense_date=datetime.utcnow().date(),
            split_type=split_type
        )
        db.session.add(expense)
        db.session.flush()  # Get expense_id
        
        # Calculate splits
        splits = calculate_expense_split(amount, member_ids, split_type)
        
        # Create split records
        for user_id, split_amount in splits.items():
            split = ExpenseSplit(
                expense_id=expense.expense_id,
                user_id=user_id,
                amount_owed=split_amount,
                is_paid=(user_id == paid_by_user_id)  # Payer is auto-marked as paid
            )
            db.session.add(split)
        
        db.session.commit()
        
        return expense
    
    def get_trip_expenses(self, trip_id):
        """Get all expenses for a trip"""
        return Expense.query.filter_by(trip_id=trip_id).order_by(Expense.expense_date.desc()).all()
    
    def get_user_balance(self, trip_id, user_id):
        """
        Calculate user's balance in trip wallet
        
        Args:
            trip_id (int): Trip ID
            user_id (int): User ID
        
        Returns:
            dict: Balance info
        """
        # Amount user paid
        paid = db.session.query(db.func.sum(Expense.amount)).filter(
            Expense.trip_id == trip_id,
            Expense.paid_by_user_id == user_id
        ).scalar() or 0
        
        # Amount user owes
        owed = db.session.query(db.func.sum(ExpenseSplit.amount_owed)).join(Expense).filter(
            Expense.trip_id == trip_id,
            ExpenseSplit.user_id == user_id
        ).scalar() or 0
        
        balance = paid - owed
        
        return {
            'paid': round(paid, 2),
            'owed': round(owed, 2),
            'balance': round(balance, 2),
            'status': 'owes' if balance < 0 else 'owed' if balance > 0 else 'settled'
        }
    
    def settle_expense(self, split_id):
        """Mark an expense split as settled"""
        split = ExpenseSplit.query.get(split_id)
        if split:
            split.is_paid = True
            db.session.commit()
            return True
        return False


# Singleton instance
_wallet_service = None

def get_wallet_service():
    """Get or create wallet service instance"""
    global _wallet_service
    if _wallet_service is None:
        _wallet_service = Web3WalletService()
    return _wallet_service
