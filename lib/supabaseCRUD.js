import { supabase } from "./supabaseClient";

// レコード追加
export const addRecord = async (record) => {
  try {
    const { data, error } = await supabase
      .from("casher")
      .insert([{
        date: record.date,
        person: record.person,
        money_json: record.money || {},
        total: record.total,
      }]);
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Supabase insert error:", e);
    throw e;
  }
};

// レコード更新
export const updateRecord = async (id, record) => {
  try {
    const { data, error } = await supabase
      .from("casher")
      .update({
        date: record.date,
        person: record.person,
        money_json: record.money_json,
        total: record.total,
      })
      .eq("id", id)
      .select(); // <- select() をつけると更新後のデータが返る

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    return data;
  } catch (e) {
    console.error("Supabase update catch:", e);
    throw e;
  }
};


// レコード削除
export const deleteRecord = async (id) => {
  try {
    const { data, error } = await supabase
      .from("casher")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Supabase delete error:", e);
    throw e;
  }
};

// 全件取得
export const getRecords = async () => {
  try {
    const { data, error } = await supabase
      .from("casher")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Supabase fetch error:", e);
    throw e;
  }
};
