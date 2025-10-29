from django.urls import path
from . import views

app_name = 'expenses'

urlpatterns = [
    path('<int:trip_id>/add/', views.add_expense, name='add_expense'),
    path('<int:trip_id>/list/', views.expense_list, name='expense_list'),
    path('<int:trip_id>/settlement/', views.settlement_view, name='settlement'),
]
