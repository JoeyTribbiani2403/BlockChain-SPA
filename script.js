// Initialize analytics
document.getElementById('totalCerts').textContent = 
    Object.keys(mockBlockchain.certificates).length;

// --------------------- VERIFICATION ---------------------
async function verifyCertificate() {
    const hash = document.getElementById('verifyHash').value.trim();
    const resultDiv = document.getElementById('verifyResult');
    const spinner = document.getElementById('verifySpinner');

    if (!hash) {
        alert('Please enter a certificate hash');
        return;
    }

    // Show loading
    spinner.style.display = 'block';
    resultDiv.innerHTML = '';

    // Simulate blockchain query
    const result = await simulateVerification(hash);

    // Hide loading
    spinner.style.display = 'none';

    // Display result
    if (result.valid) {
        const cert = result.certificate;
        resultDiv.innerHTML = `
            <div class="certificate-card">
                <div class="row">
                    <div class="col-md-8">
                        <h4 class="text-success">✓ CERTIFICATE VERIFIED</h4>
                        <p class="text-muted">This certificate is authentic and issued by Delhi University</p>
                        
                        <table class="table table-sm">
                            <tr><th width="150">Student Name:</th><td>${cert.studentName}</td></tr>
                            <tr><th>Student ID:</th><td>${cert.studentId}</td></tr>
                            <tr><th>Degree:</th><td>${cert.degree}</td></tr>
                            <tr><th>Grade:</th><td>${cert.grade}</td></tr>
                            <tr><th>Issue Date:</th><td>${new Date(cert.issueDate * 1000).toLocaleDateString()}</td></tr>
                            <tr><th>Status:</th><td><span class="badge bg-success">Valid</span></td></tr>
                        </table>

                        <div class="mt-3">
                            <small class="text-muted">Blockchain Details:</small>
                            <div class="blockchain-tx">Transaction: ${cert.transactionHash}</div>
                            <div class="blockchain-tx mt-1">Block: #${cert.blockNumber}</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div id="qr-display"></div>
                    </div>
                </div>
            </div>
        `;

        QRCode.toCanvas(hash, {width: 200}, function (error, canvas) {
            if (!error) {
                document.getElementById('qr-display').appendChild(canvas);
            }
        });

    } else if (result.exists && !result.valid) {
        const cert = result.certificate;
        resultDiv.innerHTML = `
            <div class="certificate-card invalid-cert">
                <h4 class="text-danger">⚠ CERTIFICATE REVOKED</h4>
                <p>${result.message}</p>
                <p><strong>Student:</strong> ${cert.studentName}</p>
                <p><strong>Reason:</strong> ${cert.revokedReason}</p>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <h4>✗ INVALID CERTIFICATE</h4>
                <p>This certificate hash does not exist on the blockchain.</p>
                <p class="mb-0"><strong>Possible reasons:</strong> Fake certificate, incorrect hash, or not issued by verified institution.</p>
            </div>
        `;
    }
}

// Quick test buttons
function testValidCert() {
    document.getElementById('verifyHash').value = 
        "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
    verifyCertificate();
}

function testInvalidCert() {
    document.getElementById('verifyHash').value = 
        "0xFAKEHASH123456789ABCDEF";
    verifyCertificate();
}

function testRevokedCert() {
    document.getElementById('verifyHash').value = 
        "0xb1234c567d890e1234f567890ab1cd234ef5678901234567890abcdef123456";
    verifyCertificate();
}

// --------------------- ISSUE CERTIFICATE ---------------------
document.getElementById('issueForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const studentData = {
        name: document.getElementById('studentName').value,
        id: document.getElementById('studentId').value,
        degree: document.getElementById('degree').value,
        grade: document.getElementById('grade').value
    };

    const spinner = document.getElementById('issueSpinner');
    const resultDiv = document.getElementById('issueResult');

    spinner.style.display = 'block';
    resultDiv.innerHTML = '';

    const result = await simulateIssueCertificate(studentData);

    spinner.style.display = 'none';

    resultDiv.innerHTML = `
        <div class="alert alert-success mt-4">
            <h4>✓ Certificate Issued Successfully!</h4>
            <p>The certificate has been recorded on the blockchain.</p>
            
            <table class="table table-sm bg-white">
                <tr><th>Certificate Hash:</th><td class="blockchain-tx">${result.certificateHash}</td></tr>
                <tr><th>Transaction Hash:</th><td class="blockchain-tx">${result.transactionHash}</td></tr>
                <tr><th>Block Number:</th><td>#${result.blockNumber}</td></tr>
            </table>

            <div id="issued-qr" class="mt-3 text-center"></div>

            <button class="btn btn-primary mt-2" onclick="downloadCertificatePDF('${result.certificateHash}')">
                📄 Download Certificate PDF
            </button>
        </div>
    `;

    QRCode.toCanvas(result.certificateHash, {width: 200}, function (error, canvas) {
        if (!error) {
            document.getElementById('issued-qr').appendChild(canvas);
            const p = document.createElement('p');
            p.className = 'text-muted mt-2';
            p.textContent = 'QR Code for Certificate Verification';
            document.getElementById('issued-qr').appendChild(p);
        }
    });

    document.getElementById('totalCerts').textContent = 
        Object.keys(mockBlockchain.certificates).length;

    this.reset();
});

// --------------------- STUDENT PORTAL ---------------------
function loadStudentCertificates() {
    const studentId = document.getElementById('studentIdLookup').value.trim();
    const resultDiv = document.getElementById('studentCertificates');

    if (!studentId) {
        alert('Please enter a Student ID');
        return;
    }

    const certHashes = mockBlockchain.students[studentId];

    if (!certHashes || certHashes.length === 0) {
        resultDiv.innerHTML = `
            <div class="alert alert-warning">
                No certificates found for Student ID: ${studentId}
            </div>
        `;
        return;
    }

    let html = `<h5>Certificates for Student ID: ${studentId}</h5>`;
    
    certHashes.forEach(hash => {
        const cert = mockBlockchain.certificates[hash];
        html += `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${cert.degree}</h5>
                    <p class="card-text">
                        <strong>Grade:</strong> ${cert.grade}<br>
                        <strong>Issued:</strong> ${new Date(cert.issueDate * 1000).toLocaleDateString()}<br>
                        <strong>Status:</strong> <span class="badge bg-success">Valid</span>
                    </p>
                    <button class="btn btn-sm btn-primary" onclick="viewCertificateDetails('${hash}')">
                        View Details
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="shareCertificate('${hash}')">
                        Share Certificate
                    </button>
                </div>
            </div>
        `;
    });

    resultDiv.innerHTML = html;
}

function viewCertificateDetails(hash) {
    document.querySelector('a[href="#verify"]').click();
    document.getElementById('verifyHash').value = hash;
    verifyCertificate();
}

function shareCertificate(hash) {
    const shareUrl = `https://educhain.example.com/verify?hash=${hash}`;
    alert(`Certificate Share Link:\n${shareUrl}\n\n(In production, this would be a real shareable link)`);
}

function downloadCertificatePDF(hash) {
    alert('In production, this would generate and download a PDF certificate with embedded QR code.\n\nFor simulation: PDF generation feature demonstrated.');
}
