import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { registerDonor, registerShelter } from './backend';

export interface RegisterParams {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phoneNumber: string;
    userType: 'donor' | 'shelter';
    shelterName?: string;
}

export interface RegisterResult {
    success: boolean;
    userId?: string;
    userType?: string;
    userName?: string;
    shelterName?: string;
    error?: string;
}

export async function register(params: RegisterParams): Promise<RegisterResult> {
    const { email, password, confirmPassword, name, phoneNumber, userType, shelterName } = params;

    // Validation
    if (password !== confirmPassword) {
        return { success: false, error: "Passwords don't match" };
    }

    if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
    }

    try {
        // Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        
        // Register user in backend
        if (userType === 'donor') {
            await registerDonor({
                userID: userId,
                username: name,
                email: email,
                phone_number: phoneNumber,
            });
        } else if (userType === 'shelter') {
            await registerShelter({
                userID: userId,
                username: name,
                shelter_name: shelterName || '',
                email: email,
                phone_number: phoneNumber,
            });
        }
        
        // Store user type in localStorage
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', name);
        localStorage.setItem('userId', userId);
        if (userType === 'shelter' && shelterName) {
            localStorage.setItem('shelterName', shelterName);
        }
        
        return {
            success: true,
            userId,
            userType,
            userName: name,
            shelterName: userType === 'shelter' ? shelterName : undefined
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}