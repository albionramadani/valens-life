"use client"
import { useState } from "react";

const Searchbar = ({ isSearch, setIsSearch }: any) => {
    const [searchValue, setSearchValue] = useState("");

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchValue('');
        setIsSearch(false);
    };

    return (
        <div className={`${isSearch ? "search-visible" : ""}`}>
            <div className="search-popup-wrap">
                <div className="search-wrap text-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="search-form">            
                                    <form onSubmit={handleSubmit}>
                                        <input
                                            type="text"
                                            placeholder="Enter your keyword..."
                                            value={searchValue}
                                            onChange={handleSearchChange}
                                        />
                                        <button type="submit" className="search-btn">
                                            <i className="flaticon-search"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div onClick={() => setIsSearch(false)} className="search-backdrop"></div>
        </div>
    )
}

export default Searchbar
