// Helper để lưu kết quả khảo sát
export async function saveResult({ overallStress, highestDomain, domains }) {
  try {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overallStress, highestDomain, domains })
    });
    const data = await res.json();
    console.log('Đã lưu kết quả:', data);
    return data;
  } catch (err) {
    console.error('Lỗi lưu kết quả:', err);
  }
}