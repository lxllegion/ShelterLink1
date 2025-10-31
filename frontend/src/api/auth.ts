import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
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
    userName?: string;
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
    const { email, password, confirmPassword, name, phoneNumber, userType, shelterName, userName } = params;

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
        try {
            let backendResponse;
            if (userType === 'donor') {
                backendResponse = await registerDonor({
                    userID: userId,
                    name: name,
                    username: userName!,
                    email: email,
                    phone_number: phoneNumber,
                });
            } else if (userType === 'shelter') {
                backendResponse = await registerShelter({
                    userID: userId,
                    username: shelterName || '',
                    shelter_name: shelterName!,
                    email: email,
                    phone_number: phoneNumber,
                });
            }
            
            // Check if backend registration failed
            if (backendResponse && backendResponse.error) {
                // Delete the Firebase user since backend registration failed
                await deleteUser(userCredential.user);
                return { success: false, error: backendResponse.error };
            }
        } catch (backendError: any) {
            // Backend registration failed, delete the Firebase user
            try {
                await deleteUser(userCredential.user);
            } catch (deleteError) {
                console.error('Error deleting Firebase user:', deleteError);
            }
            return { success: false, error: backendError.message };
        }
        
        // Add a delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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