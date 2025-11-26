export default function ProofsReview(){
  const proofs = []
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Payment Proofs</h2>
      {!proofs.length && <div className="bg-white p-4 rounded shadow">No proofs uploaded (demo)</div>}
    </div>
  )
}
