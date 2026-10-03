import { notFound } from 'next/navigation';

const TITLES = {
  shipping: 'Shipping & Returns',
  returns: 'Returns & Refunds',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
};

// Only statements confirmed by the client. Wording is pending the client's approval before publication.
// Terms and Privacy stay as placeholders until the client supplies approved text.
const RETURNS = 'Printed products cannot be returned or refunded.';
const SHIPPING = [
  'Cash on Delivery is the only payment method.',
  'The delivery charge depends on your location. After you place an order, the owner will call you to confirm the delivery charge and the final payable amount.',
];

const CONTENT = {
  shipping: [...SHIPPING, RETURNS],
  returns: [RETURNS],
};

export default function PolicyPage({ params }) {
  const title = TITLES[params.slug];
  if (!title) notFound(); // unknown policy slugs should 404 instead of showing a generic page
  const paragraphs = CONTENT[params.slug];

  return (
    <div className="px-4 py-10 max-w-3xl mx-auto">
      <h1 className="font-heading text-xl mb-4">{title.toUpperCase()}</h1>
      {paragraphs ? (
        <div className="space-y-3 text-text-secondary text-sm leading-relaxed">
          {paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-sm leading-relaxed">
          Placeholder policy text — replace with Supreme India's actual {title.toLowerCase()} before
          launch.
        </p>
      )}
    </div>
  );
}
