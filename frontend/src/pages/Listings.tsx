import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to Products page
const Listings: React.FC = () => {
  return <Navigate to="/products" replace />;
};

export default Listings;

                <div key={product.id} className="border rounded-lg p-4">
                    <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded" />
                    <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
                    <p className="text-gray-600">Rent: ${product.rentPrice} per day</p>
                    <a
                        href={`https://wa.me/919162573098?text=I%20would%20like%20to%20rent%20${product.name}`}
                        className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded"
                    >
                        Rent via WhatsApp
                    </a>
                </div>
            ))}
        </div>
    );
};

export default Listings;