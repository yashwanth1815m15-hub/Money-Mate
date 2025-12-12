CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Create default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  -- Create default budget
  INSERT INTO public.budgets (user_id, monthly_budget) VALUES (NEW.id, 50000);
  
  -- Create default categories
  INSERT INTO public.categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Food & Dining', 'utensils', '#ef4444'),
    (NEW.id, 'Transportation', 'car', '#f97316'),
    (NEW.id, 'Shopping', 'shopping-bag', '#eab308'),
    (NEW.id, 'Entertainment', 'film', '#22c55e'),
    (NEW.id, 'Bills & Utilities', 'zap', '#3b82f6'),
    (NEW.id, 'Healthcare', 'heart', '#ec4899'),
    (NEW.id, 'Travel', 'plane', '#8b5cf6'),
    (NEW.id, 'Education', 'book', '#06b6d4'),
    (NEW.id, 'Personal Care', 'smile', '#f472b6'),
    (NEW.id, 'Others', 'more-horizontal', '#6b7280');
  
  -- Create welcome notification
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.id, 'welcome', 'Welcome to Money-Mate!', 'Your account has been created successfully. Start tracking your expenses now!');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_group_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    monthly_budget numeric(12,2) DEFAULT 0 NOT NULL,
    alert_threshold integer DEFAULT 80,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    icon text,
    color text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: category_budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid,
    category_name text NOT NULL,
    limit_amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    converted_amount numeric(12,2),
    category_id uuid,
    category_name text,
    subcategory text,
    date date DEFAULT CURRENT_DATE NOT NULL,
    type text NOT NULL,
    group_id uuid,
    payment_status text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT expenses_payment_status_check CHECK ((payment_status = ANY (ARRAY['paid'::text, 'you_owe'::text, 'you_are_owed'::text]))),
    CONSTRAINT expenses_type_check CHECK ((type = ANY (ARRAY['personal'::text, 'group'::text])))
);


--
-- Name: group_expense_splits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_expense_splits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    expense_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount_owed numeric(12,2) NOT NULL,
    is_paid boolean DEFAULT false,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    display_name text,
    preferred_currency text DEFAULT 'INR'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: recurring_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    category_id uuid,
    category_name text,
    frequency text NOT NULL,
    next_due_date date NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT recurring_expenses_frequency_check CHECK ((frequency = ANY (ARRAY['weekly'::text, 'monthly'::text])))
);


--
-- Name: savings_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.savings_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    target_amount numeric(12,2) NOT NULL,
    current_amount numeric(12,2) DEFAULT 0 NOT NULL,
    deadline date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL
);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_key UNIQUE (user_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_name_key UNIQUE (user_id, name);


--
-- Name: category_budgets category_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_budgets
    ADD CONSTRAINT category_budgets_pkey PRIMARY KEY (id);


--
-- Name: category_budgets category_budgets_user_id_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_budgets
    ADD CONSTRAINT category_budgets_user_id_category_name_key UNIQUE (user_id, category_name);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: group_expense_splits group_expense_splits_expense_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_expense_splits
    ADD CONSTRAINT group_expense_splits_expense_id_user_id_key UNIQUE (expense_id, user_id);


--
-- Name: group_expense_splits group_expense_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_expense_splits
    ADD CONSTRAINT group_expense_splits_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: recurring_expenses recurring_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_expenses
    ADD CONSTRAINT recurring_expenses_pkey PRIMARY KEY (id);


--
-- Name: savings_goals savings_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.savings_goals
    ADD CONSTRAINT savings_goals_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: budgets update_budgets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: category_budgets update_category_budgets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_category_budgets_updated_at BEFORE UPDATE ON public.category_budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: expenses update_expenses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: groups update_groups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recurring_expenses update_recurring_expenses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON public.recurring_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: savings_goals update_savings_goals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: budgets budgets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: category_budgets category_budgets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_budgets
    ADD CONSTRAINT category_budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: category_budgets category_budgets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_budgets
    ADD CONSTRAINT category_budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: expenses expenses_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_expense_splits group_expense_splits_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_expense_splits
    ADD CONSTRAINT group_expense_splits_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: group_expense_splits group_expense_splits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_expense_splits
    ADD CONSTRAINT group_expense_splits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: groups groups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: recurring_expenses recurring_expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_expenses
    ADD CONSTRAINT recurring_expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: recurring_expenses recurring_expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_expenses
    ADD CONSTRAINT recurring_expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: savings_goals savings_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.savings_goals
    ADD CONSTRAINT savings_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_expense_splits Expense creators can create splits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Expense creators can create splits" ON public.group_expense_splits FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.expenses e
  WHERE ((e.id = group_expense_splits.expense_id) AND (e.user_id = auth.uid())))));


--
-- Name: group_members Group creators can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can add members" ON public.group_members FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.groups
  WHERE ((groups.id = group_members.group_id) AND (groups.created_by = auth.uid())))));


--
-- Name: groups Group creators can delete groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can delete groups" ON public.groups FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: group_members Group creators can remove members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can remove members" ON public.group_members FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.groups
  WHERE ((groups.id = group_members.group_id) AND (groups.created_by = auth.uid())))));


--
-- Name: groups Group creators can update groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can update groups" ON public.groups FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: groups Group members can view groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can view groups" ON public.groups FOR SELECT USING ((public.is_group_member(auth.uid(), id) OR (created_by = auth.uid())));


--
-- Name: group_members Group members can view members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can view members" ON public.group_members FOR SELECT USING (public.is_group_member(auth.uid(), group_id));


--
-- Name: category_budgets Users can create category budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create category budgets" ON public.category_budgets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: expenses Users can create expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create expenses" ON public.expenses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: groups Users can create groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: recurring_expenses Users can create recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create recurring expenses" ON public.recurring_expenses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: savings_goals Users can create savings goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create savings goals" ON public.savings_goals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: budgets Users can create their budget; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their budget" ON public.budgets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: notifications Users can create their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their notifications" ON public.notifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: categories Users can create their own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: category_budgets Users can delete their category budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their category budgets" ON public.category_budgets FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can delete their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their notifications" ON public.notifications FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: categories Users can delete their own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: expenses Users can delete their own expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: recurring_expenses Users can delete their recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their recurring expenses" ON public.recurring_expenses FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: savings_goals Users can delete their savings goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their savings goals" ON public.savings_goals FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: budgets Users can update their budget; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their budget" ON public.budgets FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: category_budgets Users can update their category budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their category budgets" ON public.category_budgets FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: categories Users can update their own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: expenses Users can update their own expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: group_expense_splits Users can update their own splits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own splits" ON public.group_expense_splits FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: recurring_expenses Users can update their recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their recurring expenses" ON public.recurring_expenses FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: savings_goals Users can update their savings goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their savings goals" ON public.savings_goals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view other profiles for invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view other profiles for invites" ON public.profiles FOR SELECT USING (true);


--
-- Name: budgets Users can view their budget; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their budget" ON public.budgets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: category_budgets Users can view their category budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their category budgets" ON public.category_budgets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: categories Users can view their own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: expenses Users can view their personal expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their personal expenses" ON public.expenses FOR SELECT USING ((((type = 'personal'::text) AND (user_id = auth.uid())) OR ((type = 'group'::text) AND public.is_group_member(auth.uid(), group_id))));


--
-- Name: recurring_expenses Users can view their recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their recurring expenses" ON public.recurring_expenses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: savings_goals Users can view their savings goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their savings goals" ON public.savings_goals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: group_expense_splits Users can view their splits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their splits" ON public.group_expense_splits FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.expenses e
  WHERE ((e.id = group_expense_splits.expense_id) AND (e.user_id = auth.uid()))))));


--
-- Name: budgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: category_budgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: group_expense_splits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_expense_splits ENABLE ROW LEVEL SECURITY;

--
-- Name: group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: recurring_expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: savings_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


