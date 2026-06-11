-- 在 Supabase SQL Editor 執行此檔案
-- Project > SQL Editor > New query

-- 食譜表
create table if not exists recipes (
  id bigserial primary key,
  name text not null,
  servings integer not null default 2,
  favorite boolean not null default false,
  last_used timestamptz,
  tags jsonb not null default '{}',
  ingredients jsonb not null default '{}',
  urls jsonb not null default '[]',
  note text not null default '',
  created_at timestamptz not null default now()
);

-- 應用設定表（只會有一筆資料）
create table if not exists app_settings (
  id integer primary key default 1,
  tag_types jsonb not null default '{}',
  ingredient_categories jsonb not null default '[]',
  common_ingredients jsonb not null default '{}'
);

-- 插入預設設定
insert into app_settings (id, tag_types, ingredient_categories, common_ingredients)
values (
  1,
  '{"料理風格": ["中式","西式","日式","韓式","泰式","義式"], "難易度": ["簡單","中等","困難"], "場合": ["日常","宴客","便當","快速料理","節日"]}',
  '["肉類","蔬菜","其他","調味料"]',
  '{"肉類": ["雞肉","豬肉","牛肉","蛋","豬絞肉","雞絞肉","培根","蝦","鮭魚","豆腐"], "蔬菜": ["番茄","洋蔥","蔥","蒜","薑","高麗菜","青椒","紅蘿蔔","白菜","菠菜","花椰菜","茄子"], "調味料": ["鹽","糖","醬油","米酒","白醋","番茄醬","番茄糊","黑胡椒","白胡椒","辣椒醬","蠔油","味噌","芝麻油"], "其他": ["義大利麵","白飯","麵粉","橄欖油","奶油","雞高湯","麵包粉","起司"]}'
)
on conflict (id) do nothing;

-- 開放讀寫權限（兩人共用，不需登入）
alter table recipes enable row level security;
alter table app_settings enable row level security;

create policy "anyone can read recipes" on recipes for select using (true);
create policy "anyone can insert recipes" on recipes for insert with check (true);
create policy "anyone can update recipes" on recipes for update using (true);
create policy "anyone can delete recipes" on recipes for delete using (true);

create policy "anyone can read settings" on app_settings for select using (true);
create policy "anyone can update settings" on app_settings for update using (true);
