import PatronForm from '@/components/PatronForm';

export default function NewPatronPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#fff8e7' }}>Register Patron</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Add a new patron to the system</p>
      </div>
      <PatronForm />
    </div>
  );
}
