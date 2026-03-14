/**
 * BỘ KIỂM THỬ CHO DỊCH VỤ XÁC THỰC - ĐĂNG NHẬP (AUTH SERVICE - SIGNIN)
 * Được phân chia thành các trường hợp Thành công và Thất bại.
 * Mô tả ngắn gọn, súc tích.
 */

// Giả lập biến môi trường để tránh lỗi khi khởi tạo mail.util
process.env.MAIL_USER = 'test@example.com';
process.env.MAIL_PASS = 'dummy_pass';

// Mock các dependency TRƯỚC KHI require service để tránh tác dụng phụ
jest.mock('../models/user.model');
jest.mock('../models/authProvider.model');
jest.mock('../utils/password.util');
jest.mock('../utils/token.util');
jest.mock('../utils/mail.util');
jest.mock('../utils/otp.util');
jest.mock('../utils/google.util');

const AuthService = require('../services/auth.service');
const { AuthProvider } = require('../models/authProvider.model');
const { comparePassword } = require('../utils/password.util');
const { generateAccessToken } = require('../utils/token.util');

describe('AuthService - signin', () => {
    const email = 'test@example.com';
    const password = 'password123';

    // Dữ liệu mẫu dùng cho test
    const mockUser = {
        id: 1,
        email,
        role: 'CUSTOMER',
        is_active: true,
        first_name: 'John',
        last_name: 'Doe'
    };

    const mockAuth = {
        user_id: 1,
        provider: 'EMAIL',
        provider_id: email,
        password_hash: 'hashed_password',
        is_verified: true,
        User: mockUser
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================================
    // 1. CÁC TRƯỜNG HỢP THÀNH CÔNG
    // ==========================================================================
    describe('Trường hợp thành công', () => {
        test('đăng nhập thành công với thông tin hợp lệ', async () => {
            AuthProvider.findOne.mockResolvedValue(mockAuth);
            comparePassword.mockResolvedValue(true);
            generateAccessToken.mockReturnValue('mock_token');

            const result = await AuthService.signin(email, password);

            expect(result).toHaveProperty('access_token', 'mock_token');
            expect(result.user.email).toBe(email);
            expect(AuthProvider.findOne).toHaveBeenCalledWith(expect.objectContaining({
                where: { provider: 'EMAIL', provider_id: email }
            }));
        });
    });

    // ==========================================================================
    // 2. CÁC TRƯỜNG HỢP THẤT BẠI
    // ==========================================================================
    describe('Trường hợp thất bại', () => {

        // Kiểm tra định danh và xác thực
        test('báo lỗi nếu không tìm thấy tài khoản (email không tồn tại)', async () => {
            AuthProvider.findOne.mockResolvedValue(null);

            await expect(AuthService.signin(email, password))
                .rejects.toThrow('Invalid credentials');
        });

        test('báo lỗi nếu tài khoản chưa được xác thực email', async () => {
            const unverifiedAuth = { ...mockAuth, is_verified: false };
            AuthProvider.findOne.mockResolvedValue(unverifiedAuth);

            await expect(AuthService.signin(email, password))
                .rejects.toThrow('Invalid credentials');
        });

        // Kiểm tra tính toàn vẹn dữ liệu
        test('báo lỗi nếu thông tin người dùng (User) bị thiếu trong DB', async () => {
            const noUserAuth = { ...mockAuth, User: null };
            AuthProvider.findOne.mockResolvedValue(noUserAuth);

            // Chấp nhận lỗi phát sinh do code gốc xử lý User null
            await expect(AuthService.signin(email, password)).rejects.toThrow();
        });

        // Kiểm tra bảo mật
        test('báo lỗi nếu mật khẩu không chính xác', async () => {
            AuthProvider.findOne.mockResolvedValue(mockAuth);
            comparePassword.mockResolvedValue(false);

            await expect(AuthService.signin(email, password))
                .rejects.toThrow('Invalid credentials');
        });

        // Kiểm tra trạng thái tài khoản
        test('báo lỗi nếu tài khoản đã bị khóa (is_active: false)', async () => {
            const inactiveAuth = { ...mockAuth, User: { ...mockUser, is_active: false } };
            AuthProvider.findOne.mockResolvedValue(inactiveAuth);

            await expect(AuthService.signin(email, password))
                .rejects.toThrow('User account is deactivated');
        });

        // Lỗi hệ thống/Cơ sở dữ liệu
        test('báo lỗi nếu truy vấn cơ sở dữ liệu thất bại', async () => {
            AuthProvider.findOne.mockRejectedValue(new Error('DB Connection Error'));

            await expect(AuthService.signin(email, password))
                .rejects.toThrow('DB Connection Error');
        });

        test('báo lỗi nếu quá trình tạo access token thất bại', async () => {
            AuthProvider.findOne.mockResolvedValue(mockAuth);
            comparePassword.mockResolvedValue(true);
            generateAccessToken.mockImplementation(() => {
                throw new Error('Token generation failed');
            });

            await expect(AuthService.signin(email, password))
                .rejects.toThrow('Token generation failed');
        });
    });
});
