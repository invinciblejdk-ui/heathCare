package com.healthCare.order.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbConstraintInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DbConstraintInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    public DbConstraintInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and applying cross-schema database constraints...");
        try {
            // 1. Cross-schema constraint between order_service.carts and onboarding_service.users
            String sql = "DO $$\n" +
                    "BEGIN\n" +
                    "    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_carts_user') THEN\n" +
                    "        ALTER TABLE order_service.carts\n" +
                    "        ADD CONSTRAINT fk_carts_user\n" +
                    "        FOREIGN KEY (user_id)\n" +
                    "        REFERENCES onboarding_service.users(id)\n" +
                    "        ON DELETE CASCADE;\n" +
                    "    END IF;\n" +
                    "END $$;";
            jdbcTemplate.execute(sql);
            log.info("Cross-schema database constraint fk_carts_user verified/applied successfully.");

            // 3. Cascade delete constraint between order_service.cart_items(user_id) and onboarding_service.users(id)
            String cartItemsUserSql = "DO $$\n" +
                    "BEGIN\n" +
                    "    -- Add column user_id if it doesn't exist\n" +
                    "    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'order_service' AND table_name = 'cart_items' AND column_name = 'user_id') THEN\n" +
                    "        ALTER TABLE order_service.cart_items ADD COLUMN user_id bigint;\n" +
                    "    END IF;\n" +
                    "\n" +
                    "    -- Backfill user_id from carts table\n" +
                    "    UPDATE order_service.cart_items ci\n" +
                    "    SET user_id = c.user_id\n" +
                    "    FROM order_service.carts c\n" +
                    "    WHERE ci.cart_id = c.id AND ci.user_id IS NULL;\n" +
                    "\n" +
                    "    -- Make user_id NOT NULL\n" +
                    "    ALTER TABLE order_service.cart_items ALTER COLUMN user_id SET NOT NULL;\n" +
                    "\n" +
                    "    -- Add foreign key with ON DELETE CASCADE\n" +
                    "    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cart_items_user') THEN\n" +
                    "        ALTER TABLE order_service.cart_items\n" +
                    "        ADD CONSTRAINT fk_cart_items_user\n" +
                    "        FOREIGN KEY (user_id)\n" +
                    "        REFERENCES onboarding_service.users(id)\n" +
                    "        ON DELETE CASCADE;\n" +
                    "    END IF;\n" +
                    "END $$;";
            jdbcTemplate.execute(cartItemsUserSql);
            log.info("Database constraint fk_cart_items_user verified/applied successfully.");
        } catch (Exception e) {
            log.error("Failed to apply database constraints: {}", e.getMessage());
        }
    }
}
