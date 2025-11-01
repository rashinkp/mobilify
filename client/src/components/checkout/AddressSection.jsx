import { MapPin, Plus, ChevronDown, ChevronUp } from "lucide-react";
import AddAddressForm from "../user/AddAddressForm";
import { addressValidationSchema } from "../../validations/validationSchemas";

const  AddressSection = ({
  addresses,
  selectedAddress,
  setSelectedAddress,
  isAddingAddress,
  setIsAddingAddress,
  handleAddAddress,
  hasMoreAddresses,
  showAllAddresses,
  setShowAllAddresses,
  isLoadingAll,
}) => {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <MapPin className="mr-2" /> Shipping Address
      </h2>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-5">
          {hasMoreAddresses && !showAllAddresses && (
            <button
              onClick={() => setShowAllAddresses(true)}
              className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
            >
              View All Addresses
              <ChevronDown size={16} className="ml-1" />
            </button>
          )}
          {showAllAddresses && (
            <button
              onClick={() => setShowAllAddresses(false)}
              className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
            >
              Show Less
              <ChevronUp size={16} className="ml-1" />
            </button>
          )}
          <button
            onClick={() => setIsAddingAddress(true)}
            className="text-green-600 ms-auto hover:text-green-700 flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add New
          </button>
        </div>
        {isAddingAddress && (
          <AddAddressForm
            onCancel={() => setIsAddingAddress(false)}
            validationSchema={addressValidationSchema}
            onSubmit={handleAddAddress}
          />
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {isLoadingAll ? (
          <p className="text-gray-500 col-span-2 text-center">Loading all addresses...</p>
        ) : addresses?.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address._id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedAddress?._id === address._id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-black"
                  : "hover:bg-gray-100 hover:dark:bg-gray-500"
              }`}
              onClick={() => setSelectedAddress(address)}
            >
              <h3 className="font-semibold">{address.label}</h3>
              <p>{address.street}</p>
              <p>{`${address.city}, ${address.state} ${address.zip}`}</p>
              <p>{address.phone}</p>
            </div>
          ))
        ) : (
          <p className="text-red-500 col-span-2 text-center">
            Address is not available
          </p>
        )}
      </div>
    </section>
  );
};


export default AddressSection