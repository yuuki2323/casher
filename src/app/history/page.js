"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecords, updateRecord, deleteRecord } from "../../../lib/supabaseCRUD";

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [passwordModal, setPasswordModal] = useState({ show: false, action: "", recordId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, recordId: null });
  const [passwordInput, setPasswordInput] = useState("");
  const [filterPerson, setFilterPerson] = useState("all");

  const correctPassword = "0512";

  const fetchRecords = async () => {
    const data = await getRecords();
    setRecords(data || []);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    await deleteRecord(id);
    fetchRecords();
    setDeleteConfirm({ show: false, recordId: null });
  };

  const handleEdit = (record) => {
    setEditingRecord({ ...record, money: record.money_json || {} });
  };

  const saveEdit = async () => {
    const updatedRecord = {
      ...editingRecord,
      money_json: editingRecord.money,
      total: Object.entries(editingRecord.money).reduce((sum, [k, v]) => sum + Number(k) * Number(v), 0),
    };
    await updateRecord(updatedRecord.id, updatedRecord);
    setEditingRecord(null);
    fetchRecords();
  };

  const verifyPassword = () => {
    if (passwordInput === correctPassword) {
      const rec = records.find(r => r.id === passwordModal.recordId);
      if (passwordModal.action === "delete") setDeleteConfirm({ show: true, recordId: passwordModal.recordId });
      if (passwordModal.action === "edit") handleEdit(rec);
      setPasswordModal({ show: false, action: "", recordId: null });
      setPasswordInput("");
    } else {
      alert("パスワードが違います！");
      setPasswordInput("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6 relative">
      {/* 入力画面ボタン */}
      <Link
        href="/"
        className="absolute top-4 sm:top-6 right-4 bg-gray-200 hover:bg-gray-300 rounded-full py-2 px-4 text-lg font-semibold transition"
      >
        入力
      </Link>

      {/* タイトル + フィルター */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold">履歴一覧</h1>
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
        <p className="text-center text-gray-500 text-lg sm:text-xl">データがありません。</p>
      ) : (
        <ul className="space-y-4">
          {records
            .filter(r => filterPerson === "all" || r.person === filterPerson)
            .slice().reverse()
            .map((r) => (
              <li key={r.id} className="border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2 sm:gap-0">
                  <p className="font-semibold text-lg sm:text-xl">
                    {r.date} {r.person}{" "}
                    <span className="text-blue-600 font-bold text-lg sm:text-2xl">¥{(r.total || 0).toLocaleString()}</span>
                  </p>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      className="text-sm sm:text-lg text-blue-500 hover:underline"
                    >
                      {openId === r.id ? "閉じる" : "詳細"}
                    </button>
                    <button
                      onClick={() => setPasswordModal({ show: true, action: "edit", recordId: r.id })}
                      className="text-sm sm:text-lg text-green-500 hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => setPasswordModal({ show: true, action: "delete", recordId: r.id })}
                      className="text-sm sm:text-lg text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* 詳細表示 */}
                {openId === r.id && r.money_json && (
                  <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border shadow-inner overflow-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      {Object.entries(r.money_json).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center border p-2 rounded-xl">
                          <span className="text-lg">{k}円</span>
                          <span className="font-bold text-black text-lg">×</span>
                          <span className="text-lg">{v}枚</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-right mt-2 font-bold text-lg sm:text-2xl text-blue-700">
                      合計：¥{r.total.toLocaleString()}
                    </div>
                  </div>
                )}
              </li>
            ))}
        </ul>
      )}

      {/* モーダル類（パスワード・削除・編集） */}
      {/* パスワードモーダル */}
      {passwordModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow w-full max-w-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">パスワード入力</h2>
            <input
              type="password"
              className="border rounded p-2 sm:p-3 w-full mb-4 text-lg sm:text-xl"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="パスワード"
            />
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                className="bg-gray-300 rounded-2xl px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg"
                onClick={() => setPasswordModal({ show: false, action: "", recordId: null })}
              >
                キャンセル
              </button>
              <button
                className="bg-blue-500 text-white rounded-2xl px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg"
                onClick={verifyPassword}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow w-full max-w-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">削除確認</h2>
            <p className="text-lg sm:text-xl mb-4">本当に削除しますか？</p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                className="bg-gray-300 rounded-2xl px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg"
                onClick={() => setDeleteConfirm({ show: false, recordId: null })}
              >
                キャンセル
              </button>
              <button
                className="bg-red-500 text-white rounded-2xl px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg"
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-12 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow w-full max-w-2xl max-h-[90vh] overflow-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">編集</h2>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="flex-1">
                <label className="block text-lg sm:text-xl font-semibold mb-2">日付</label>
                <input
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                  className="border rounded-lg p-2 sm:p-4 w-full text-lg sm:text-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-lg sm:text-xl font-semibold mb-2">担当者</label>
                <select
                  value={editingRecord.person}
                  onChange={(e) => setEditingRecord({ ...editingRecord, person: e.target.value })}
                  className="border rounded-lg p-2 sm:p-4 w-full text-lg sm:text-xl focus:ring-2 focus:ring-blue-400"
                >
                  <option>SHIHO</option>
                  <option>MAMI</option>
                  <option>SUZU</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg sm:text-2xl font-semibold border-b pb-1 mt-4">金種</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mt-2">
              {editingRecord.money && Object.keys(editingRecord.money).map((k) => (
                <div key={k} className="flex justify-between items-center border p-2 rounded-xl">
                  <span className="text-lg">{k}円</span>
                  <span className="font-bold text-black text-lg">×</span>
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
                    className="w-16 sm:w-20 border rounded-md p-1 sm:p-3 text-right text-lg"
                  />
                  <span>枚</span>
                </div>
              ))}
            </div>

            <div className="text-right font-bold text-lg sm:text-2xl border-t pt-3 text-blue-600">
              合計：¥{editingRecord.money
                ? Object.entries(editingRecord.money).reduce((sum, [k, v]) => sum + Number(k) * Number(v), 0).toLocaleString()
                : 0}
            </div>

            <div className="flex justify-end gap-2 sm:gap-4">
              <button className="bg-gray-300 rounded-3xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg" onClick={() => setEditingRecord(null)}>
                キャンセル
              </button>
              <button className="bg-blue-500 text-white rounded-3xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg" onClick={saveEdit}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
