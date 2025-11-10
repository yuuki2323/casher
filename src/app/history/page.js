"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecords, updateRecord, deleteRecord } from "../../../lib/supabaseCRUD"; // Supabase用CRUD関数

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [passwordModal, setPasswordModal] = useState({ show: false, action: "", recordId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, recordId: null });
  const [passwordInput, setPasswordInput] = useState("");
  const [filterPerson, setFilterPerson] = useState("all");

  const correctPassword = "0512";

  // レコード取得
  const fetchRecords = async () => {
    const data = await getRecords(); // Supabaseから全件取得
    setRecords(data || []);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // 削除
  const handleDelete = async (id) => {
    await deleteRecord(id);
    fetchRecords();
    setDeleteConfirm({ show: false, recordId: null });
  };

  // 編集開始
  const handleEdit = (record) => {
    // money_json をコピーして編集用の money として扱う
    setEditingRecord({ ...record, money: record.money_json || {} });
  };

  // 編集保存
  const saveEdit = async () => {
    const updatedRecord = {
      ...editingRecord,
      money_json: editingRecord.money,
      total: Object.entries(editingRecord.money).reduce(
        (sum, [k, v]) => sum + Number(k) * Number(v),
        0
      ),
    };
    await updateRecord(updatedRecord.id, updatedRecord);
    setEditingRecord(null);
    fetchRecords();
  };

  // パスワード確認
  const verifyPassword = () => {
    if (passwordInput === correctPassword) {
      const rec = records.find(r => r.id === passwordModal.recordId);
      if (passwordModal.action === "delete") {
        setDeleteConfirm({ show: true, recordId: passwordModal.recordId });
      }
      if (passwordModal.action === "edit") handleEdit(rec);
      setPasswordModal({ show: false, action: "", recordId: null });
      setPasswordInput("");
    } else {
      alert("パスワードが違います！");
      setPasswordInput("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6 relative">
      {/* 入力画面ボタン */}
      <Link
        href="/"
        className="absolute top-6 right-6 bg-gray-200 hover:bg-gray-300 rounded-full py-2 px-4 text-lg font-semibold transition"
      >
        入力
      </Link>

      {/* タイトル + フィルター */}
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-4xl font-bold">履歴一覧</h1>
        <select
          value={filterPerson}
          onChange={(e) => setFilterPerson(e.target.value)}
          className="border rounded-lg p-2 text-lg"
        >
          <option value="all">全員</option>
          <option value="SHIHO">SHIHO</option>
          <option value="MAMI">MAMI</option>
          <option value="SUZU">SUZU</option>
        </select>
      </div>

      {/* 履歴一覧 */}
      {records.filter(r => filterPerson === "all" || r.person === filterPerson).length === 0 ? (
        <p className="text-center text-gray-500 text-xl">データがありません。</p>
      ) : (
        <ul className="space-y-4">
          {records
            .filter(r => filterPerson === "all" || r.person === filterPerson)
            .slice().reverse()
            .map((r) => (
              <li key={r.id} className="border rounded-3xl p-6 shadow-lg bg-gray-50">
                {/* 日付・担当者・合計 */}
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-xl">
                    {r.date} {r.person}{" "}
                    <span className="text-blue-600 font-bold text-2xl">¥{(r.total || 0).toLocaleString()}</span>
                  </p>
                  {/* ボタン群 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      className="text-lg text-blue-500 hover:underline"
                    >
                      {openId === r.id ? "閉じる" : "詳細"}
                    </button>
                    <button
                      onClick={() => setPasswordModal({ show: true, action: "edit", recordId: r.id })}
                      className="text-lg text-green-500 hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => setPasswordModal({ show: true, action: "delete", recordId: r.id })}
                      className="text-lg text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* 詳細表示（3列） */}
                {openId === r.id && r.money_json && (
                  <div className="mt-3 p-4 bg-white rounded-2xl border shadow-inner">
                    {Object.entries(r.money_json).map(([k, v], idx) => (
                      <div
                        key={k}
                        className={`grid grid-cols-3 items-center py-2 ${
                          idx !== Object.entries(r.money_json).length - 1 ? "border-b border-gray-200" : ""
                        }`}
                      >
                        <span className="text-lg font-medium text-left">{k}円</span>
                        <span className="text-lg font-bold text-black text-center">×</span>
                        <span className="text-lg font-medium text-right">{v}枚</span>
                      </div>
                    ))}
                    <div className="text-right mt-3 font-bold text-2xl text-blue-700">
                      合計：¥{r.total.toLocaleString()}
                    </div>
                  </div>
                )}
              </li>
            ))}
        </ul>
      )}

      {/* パスワード入力モーダル */}
      {passwordModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-3xl shadow w-96">
            <h2 className="text-2xl font-bold mb-4">パスワード入力</h2>
            <input
              type="password"
              className="border rounded p-3 w-full mb-4 text-xl"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="パスワード"
            />
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 rounded-2xl px-4 py-2 text-lg"
                onClick={() => setPasswordModal({ show: false, action: "", recordId: null })}
              >
                キャンセル
              </button>
              <button className="bg-blue-500 text-white rounded-2xl px-4 py-2 text-lg" onClick={verifyPassword}>
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-3xl shadow w-96">
            <h2 className="text-2xl font-bold mb-4">削除確認</h2>
            <p className="text-lg mb-4">本当に削除しますか？</p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 rounded-2xl px-4 py-2 text-lg"
                onClick={() => setDeleteConfirm({ show: false, recordId: null })}
              >
                キャンセル
              </button>
              <button
                className="bg-red-500 text-white rounded-2xl px-4 py-2 text-lg"
                onClick={() => handleDelete(deleteConfirm.recordId)}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-12">
          <div className="bg-white p-8 rounded-3xl shadow w-full max-w-2xl max-h-[90vh] overflow-auto space-y-4">
            <h2 className="text-3xl font-bold mb-4">編集</h2>

            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-xl font-semibold mb-2">日付</label>
                <input
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                  className="border rounded-lg p-4 w-full text-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xl font-semibold mb-2">担当者</label>
                <select
                  value={editingRecord.person}
                  onChange={(e) => setEditingRecord({ ...editingRecord, person: e.target.value })}
                  className="border rounded-lg p-4 w-full text-xl focus:ring-2 focus:ring-blue-400"
                >
                  <option>SHIHO</option>
                  <option>MAMI</option>
                  <option>SUZU</option>
                </select>
              </div>
            </div>

            <h3 className="text-2xl font-semibold border-b pb-1 mt-4">金種</h3>
            <div className="grid grid-cols-3 gap-3">
              {editingRecord.money && Object.keys(editingRecord.money).map((k) => (
                <div key={k} className="flex justify-between items-center border p-3 rounded-2xl">
                  <span className="text-xl">{k}円</span>
                  <span className="font-bold text-black text-xl">×</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editingRecord.money[k]}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        money: { ...editingRecord.money, [k]: Number(e.target.value) },
                      })
                    }
                    className="w-24 border rounded-md p-3 text-right text-xl"
                  />
                  <span>枚</span>
                </div>
              ))}
            </div>

            <div className="text-right font-bold text-3xl border-t pt-3 text-blue-600">
              合計：¥{editingRecord.money
                ? Object.entries(editingRecord.money).reduce((sum, [k, v]) => sum + Number(k) * Number(v), 0).toLocaleString()
                : 0}
            </div>

            <div className="flex justify-end gap-4">
              <button className="bg-gray-300 rounded-3xl px-6 py-3 text-xl" onClick={() => setEditingRecord(null)}>
                キャンセル
              </button>
              <button className="bg-blue-500 text-white rounded-3xl px-6 py-3 text-xl" onClick={saveEdit}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
