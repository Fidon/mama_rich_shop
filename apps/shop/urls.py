from django.urls import path
from . import views as v

urlpatterns = [
    path('dashboard/', v.dashboard_page, name='dashboard_page'),
    path('store/', v.inventory_page, name='inventory_page'),
    path('store/actions/', v.product_actions, name='product_actions'),
    path('store/<int:product_id>/', v.product_details, name='product_details'),
    path('sales/', v.sales_page, name='sales_page'),
    path('sales/actions/', v.sales_actions, name='sales_actions'),
    path('sales/report/', v.sales_report, name='sales_report'),
    path('sales/<int:sale_id>/', v.sales_info, name='sale_details'),
    path('sales/report/sale-items/', v.sales_items_report, name='sale_items_report'),
]
