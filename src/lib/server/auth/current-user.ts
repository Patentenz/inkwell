import type { Cookies } from '@sveltejs/kit';
import type { User } from '#lib/types/user.ts';
import { getSupabase } from '#lib/server/db/supabase.ts';
import { isId } from '#lib/utils/ids.ts';

export const USER_COOKIE = 'inkwell_user';

export const USER_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	maxAge: 60 * 60 * 24 * 365
};

export function readUserIdCookie(cookies: Cookies): string | null {
	const value = cookies.get(USER_COOKIE);
	if (isId(value)) {
		return value;
	}
	return null;
}

export async function listUsers(): Promise<User[]> {
	const supabase = getSupabase();
	const { data, error } = await supabase.from('users').select('*').order('name');

	if (error) {
		throw new Error(error.message);
	}

	return data ?? [];
}

export async function getUserById(id: string): Promise<User | null> {
	const supabase = getSupabase();
	const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

async function getFirstUserByName(): Promise<User> {
	const supabase = getSupabase();
	const { data, error } = await supabase.from('users').select('*').order('name').limit(1).single();

	if (error || !data) {
		throw new Error(error?.message ?? 'No users found');
	}

	return data;
}

export async function resolveUserId(cookies: Cookies): Promise<string> {
	const fromCookie = readUserIdCookie(cookies);
	if (fromCookie) {
		return fromCookie;
	}

	const user = await getFirstUserByName();
	cookies.set(USER_COOKIE, user.id, USER_COOKIE_OPTIONS);
	return user.id;
}

export function setUserIdCookie(cookies: Cookies, userId: string): void {
	cookies.set(USER_COOKIE, userId, USER_COOKIE_OPTIONS);
}
