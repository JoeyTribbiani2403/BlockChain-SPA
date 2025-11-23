// mockData.js - Simulated blockchain data
const mockBlockchain = {
    // University information
    university: {
        name: "Delhi University",
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9",
        publicKey: "0x04a8f2c9..."
    },
    
    // Sample certificates (simulating blockchain storage)
    certificates: {
        "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069": {
            certificateId: 1,
            studentName: "Priya Sharma",
            studentId: "2021CS001",
            degree: "B.Tech Computer Science",
            grade: "First Class with Distinction (9.2 CGPA)",
            issueDate: 1687564800, // Unix timestamp
            isValid: true,
            transactionHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            blockNumber: 12456789
        },
        "0xa3c1f45e23f8bc456d789e012f34a56b7c890d12e34f567890ab1cd234ef5678": {
            certificateId: 2,
            studentName: "Rahul Verma",
            studentId: "2021CS002",
            degree: "B.Tech Information Technology",
            grade: "Second Class (7.5 CGPA)",
            issueDate: 1687651200,
            isValid: true,
            transactionHash: "0xa3c1f45e23f8bc456d789e012f34a56b7c890d12e34f567890ab1cd234ef5678",
            blockNumber: 12456790
        },
        "0xb1234c567d890e1234f567890ab1cd234ef5678901234567890abcdef123456": {
            certificateId: 3,
            studentName: "Invalid Certificate",
            studentId: "FAKE001",
            degree: "Fake Degree",
            grade: "N/A",
            issueDate: 1687737600,
            isValid: false, // Revoked certificate
            transactionHash: "0xb1234c567d890e1234f567890ab1cd234ef5678901234567890abcdef123456",
            blockNumber: 12456791,
            revoked: true,
            revokedReason: "Academic misconduct discovered"
        }
    },
    
    // Students and their certificates
    students: {
        "2021CS001": ["0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"],
        "2021CS002": ["0xa3c1f45e23f8bc456d789e012f34a56b7c890d12e34f567890ab1cd234ef5678"]
    }
};

// Simulated verification function (replaces blockchain query)
function simulateVerification(certificateHash) {
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            const cert = mockBlockchain.certificates[certificateHash];
            
            if (!cert) {
                resolve({
                    exists: false,
                    valid: false,
                    message: "Certificate not found on blockchain"
                });
            } else if (cert.revoked) {
                resolve({
                    exists: true,
                    valid: false,
                    certificate: cert,
                    message: `Certificate revoked: ${cert.revokedReason}`
                });
            } else {
                resolve({
                    exists: true,
                    valid: true,
                    certificate: cert,
                    message: "Certificate verified successfully"
                });
            }
        }, 1500); // 1.5 second delay to simulate blockchain query
    });
}

// Simulated issuance function
function simulateIssueCertificate(studentData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate mock hash
            const hash = "0x" + Math.random().toString(16).substr(2, 64);
            
            // Create certificate object
            const newCert = {
                certificateId: Object.keys(mockBlockchain.certificates).length + 1,
                studentName: studentData.name,
                studentId: studentData.id,
                degree: studentData.degree,
                grade: studentData.grade,
                issueDate: Math.floor(Date.now() / 1000),
                isValid: true,
                transactionHash: hash,
                blockNumber: 12456789 + Object.keys(mockBlockchain.certificates).length
            };
            
            // Add to mock blockchain
            mockBlockchain.certificates[hash] = newCert;
            
            if (!mockBlockchain.students[studentData.id]) {
                mockBlockchain.students[studentData.id] = [];
            }
            mockBlockchain.students[studentData.id].push(hash);
            
            resolve({
                success: true,
                certificateHash: hash,
                transactionHash: hash,
                blockNumber: newCert.blockNumber
            });
        }, 2000); // 2 second delay to simulate blockchain transaction
    });
}
