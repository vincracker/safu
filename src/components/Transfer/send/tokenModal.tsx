import { useState } from "react";

import { ethers } from "ethers";
import Modal from "react-modal";

import { tokenslist } from "../../../constants/tokenData";
// import { AppContext } from "../../App";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "0px"
  }
};

type TokenType = {
  name: string;
  address: string;
  symbol: string;
  logoURI: string;
};

interface PropsType {
  modalIsOpen: boolean;
  setIsOpen: (e: boolean) => void;
  setToken: (token: TokenType) => void;
}

export default function TokenModal({ modalIsOpen, setIsOpen, setToken }: PropsType) {
  // const { state, dispatch } = useContext(AppContext);

  // const [loading, setLoading] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  const handleToken = (token: any) => {
    // dispatch({
    //   type: "set_token",
    //   payload: token
    // });
    setToken({
      name: token.name,
      address: token.address ? token.address : ethers.constants.AddressZero,
      symbol: token.symbol,
      logoURI: token.logoURI
    });
    console.log(token);
    closeModal();
  };

  const handleCustomToken = (tokenAddress: string) => {
    setToken({
      name: "Unknown token",
      address: tokenAddress,
      symbol: "UNK",
      logoURI: "/"
    });
    closeModal();
  };

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<any>([]);

  const handleSearch = (e: any) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchValue(searchValue);
    //filter the list of tokens names by the search value
    const newSearchResults = tokenslist.filter((token) => {
      return token.name.toLowerCase().includes(searchValue) || token.symbol.toLowerCase().includes(searchValue);
    });

    //sort new search results by the search value
    newSearchResults.sort((a, b) => {
      return a.name.toLowerCase().indexOf(searchValue) - b.name.toLowerCase().indexOf(searchValue);
    });

    setSearchResults(newSearchResults);
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Example Modal"
      ariaHideApp={false}
    >
      <div className="p-4 bg-white space-y-4 h-96 w-80 md:w-96 overflow-auto">
        <div>
          <input
            type="search"
            name="search"
            value={searchValue}
            placeholder="Search names or paste address"
            className="w-full p-2 border border-primary focus:outline-none"
            onChange={handleSearch}
          />
        </div>
        {searchResults.length > 0 && searchValue.length > 0 ? (
          searchResults.map((token: any, index: number) => {
            return (
              <div
                className="flex  gap-y-3 gap-x-3 hover:bg-slate-200 dark:hover:bg-[#0b136e63]  p-2  font-Lato  cursor-pointer"
                onClick={() => handleToken(token)}
                key={index}
              >
                <img src={token.logoURI} alt="logo" className="w-12 rounded-full" />

                <div>
                  <p className="text-lg">{token.name}</p>
                  <p className="text-sm">{token.symbol}</p>
                </div>
              </div>
            );
          })
        ) : searchResults.length <= 0 && searchValue.length > 0 ? (
          <div
            className="flex gap-y-3 gap-x-3 hover:bg-slate-200 dark:hover:bg-[#0b136e63] p-2  font-Lato  cursor-pointer"
            onClick={() => handleCustomToken(searchValue)}
          >
            <div className="w-12 rounded-full bg-indigo-400 flex justify-center items-center">UNK</div>
            <div>
              <p className="text-lg">Unknown token</p>
              <p className="text-sm">UNK</p>
            </div>
          </div>
        ) : (
          tokenslist.map((token, index) => {
            return (
              <div
                className="flex  gap-y-3 gap-x-3 hover:bg-slate-200 dark:hover:bg-[#0b136e63] p-2  font-Lato  cursor-pointer"
                onClick={() => handleToken(token)}
                key={index}
              >
                <img src={token.logoURI} alt="logo" className="w-12 rounded-full" />

                <div>
                  <p className="text-lg">{token.name}</p>
                  <p className="text-sm">{token.symbol}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
