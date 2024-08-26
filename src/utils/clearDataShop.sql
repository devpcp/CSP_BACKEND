DO $$
DECLARE shop_code text := '%01HQ%';
DECLARE f record;
DECLARE users uuid[];
BEGIN
	FOR f IN  
		SELECT shop_code_id from app_datas.dat_shops_profiles 
		where shop_code_id LIKE shop_code
	LOOP
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_inventory_management_logs ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_inventory_transaction_doc ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_sales_order_plan_logs ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_sales_transaction_out ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_sales_transaction_doc ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_stock_products_balances ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_vehicles_customers ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_business_customers ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_business_partners ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_personal_customers ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_products_price_logs ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_products ';
		EXECUTE 'drop table if exists app_shops_datas.dat_'||lower(f.shop_code_id)||'_warehouses ';	
	END LOOP;
	users = ARRAY(SELECT u.user_id from app_datas.dat_shops_profiles s
			JOIN app_datas.dat_users_profiles u ON u.shop_id = s.id
			WHERE s.shop_code_id LIKE shop_code);
	
	DELETE FROM app_datas.dat_users_profiles
		WHERE user_id = ANY(users);
	
	DELETE FROM app_datas.dat_shops_profiles
		WHERE shop_code_id LIKE shop_code;
		
	DELETE FROM systems.logs
		WHERE user_id = ANY(users);
		
	DELETE FROM	systems.sysm_maptb_user_group
		WHERE user_id = ANY(users);
		
	DELETE FROM app_datas.dat_products
		WHERE created_by = ANY(users);
		
-- 	DELETE FROM master_lookup.mas_tax_types
-- 		WHERE created_by = ANY(users);
			
	DELETE FROM	systems.sysm_users
		WHERE id = ANY(users);
			
END; $$