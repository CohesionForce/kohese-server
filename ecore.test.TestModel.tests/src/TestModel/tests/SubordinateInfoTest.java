/**
 */
package TestModel.tests;

import TestModel.SubordinateInfo;
import TestModel.TestModelFactory;

import junit.framework.TestCase;

import junit.textui.TestRunner;

/**
 * <!-- begin-user-doc -->
 * A test case for the model object '<em><b>Subordinate Info</b></em>'.
 * <!-- end-user-doc -->
 * @generated
 */
public class SubordinateInfoTest extends TestCase {

	/**
	 * The fixture for this Subordinate Info test case.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected SubordinateInfo fixture = null;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public static void main(String[] args) {
		TestRunner.run(SubordinateInfoTest.class);
	}

	/**
	 * Constructs a new Subordinate Info test case with the given name.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public SubordinateInfoTest(String name) {
		super(name);
	}

	/**
	 * Sets the fixture for this Subordinate Info test case.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected void setFixture(SubordinateInfo fixture) {
		this.fixture = fixture;
	}

	/**
	 * Returns the fixture for this Subordinate Info test case.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected SubordinateInfo getFixture() {
		return fixture;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see junit.framework.TestCase#setUp()
	 * @generated
	 */
	@Override
	protected void setUp() throws Exception {
		setFixture(TestModelFactory.eINSTANCE.createSubordinateInfo());
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see junit.framework.TestCase#tearDown()
	 * @generated
	 */
	@Override
	protected void tearDown() throws Exception {
		setFixture(null);
	}

} //SubordinateInfoTest
