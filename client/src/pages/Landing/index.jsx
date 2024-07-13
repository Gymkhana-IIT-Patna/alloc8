import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landingpage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="space-x-4">
                <Button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:bg-blue-700">
                    <Link to="/logIn" className="block w-full h-full text-center">
                        Old Student
                    </Link>
                </Button>
                <Button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:bg-green-700">
                    <Link to="/Register" className="block w-full h-full text-center">
                        New Student
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default Landingpage;
